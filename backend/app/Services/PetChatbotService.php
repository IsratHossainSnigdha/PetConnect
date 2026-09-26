<?php

namespace App\Services;

use App\Models\Pet;
use App\Models\Shelter;
use Illuminate\Support\Facades\Http;

class PetChatbotService
{
    public function chat(string $message)
    {
        $message = trim($message);
        $messageLower = strtolower($message);

        /*
        |--------------------------------------------------------------------------
        | EMPTY MESSAGE
        |--------------------------------------------------------------------------
        */

        if ($message === '') {
            return [
                'question' => $message,
                'context' => '',
                'answer' => 'Please enter a question.',
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | GET AVAILABLE PETS
        |--------------------------------------------------------------------------
        */

        $availablePets = Pet::where('status', 'available')
            ->with('shelter')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | CHECK WHETHER THIS IS A PETCONNECT QUESTION
        |--------------------------------------------------------------------------
        */

        $databaseQuestion = false;

        $databaseKeywords = [
            'pet',
            'pets',
            'dog',
            'dogs',
            'cat',
            'cats',
            'puppy',
            'puppies',
            'kitten',
            'kittens',
            'breed',
            'breeds',
            'shelter',
            'shelters',
            'adopt',
            'adoption',
            'available',
            'availability',
            'animal',
            'animals',
            'gender',
            'male',
            'female',
            'boy',
            'girl',
            'age',
            'old',
            'young',
            'location',
            'where',
            'name',
            'about',
            'description',
            'color',
            'colour',
        ];

        foreach ($databaseKeywords as $keyword) {
            if (str_contains($messageLower, $keyword)) {
                $databaseQuestion = true;
                break;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | CHECK PET NAME
        |--------------------------------------------------------------------------
        */

        $selectedPet = null;

        foreach ($availablePets as $pet) {

            if (
                $pet->name &&
                str_contains(
                    $messageLower,
                    strtolower($pet->name)
                )
            ) {
                $databaseQuestion = true;
                $selectedPet = $pet;
                break;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | CHECK SHELTER NAME
        |--------------------------------------------------------------------------
        */

        $selectedShelter = null;

        if (!$databaseQuestion) {

            $shelters = Shelter::whereNotNull('name')->get();

            foreach ($shelters as $shelter) {

                if (
                    $shelter->name &&
                    str_contains(
                        $messageLower,
                        strtolower($shelter->name)
                    )
                ) {
                    $databaseQuestion = true;
                    $selectedShelter = $shelter;
                    break;
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | REJECT UNRELATED QUESTIONS
        |--------------------------------------------------------------------------
        */

        if (!$databaseQuestion) {

            return [
                'question' => $message,
                'context' => '',
                'answer' =>
                    'I can only answer questions using information available in the PetConnect database.',
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | SPECIFIC PET QUERY
        |--------------------------------------------------------------------------
        */

        if ($selectedPet) {

            $context = $this->buildPetContext($selectedPet);

            /*
            |--------------------------------------------------------------------------
            | CHECK UNSUPPORTED INFORMATION
            |--------------------------------------------------------------------------
            */

            if (
                str_contains($messageLower, 'color') ||
                str_contains($messageLower, 'colour')
            ) {

                return [
                    'question' => $message,
                    'context' => $context,
                    'answer' =>
                        'That information is not specified in the PetConnect database.',
                ];
            }

            /*
            |--------------------------------------------------------------------------
            | SEND PET DATA TO GEMINI
            |--------------------------------------------------------------------------
            */

            $answer = $this->askGemini(
                $message,
                $context
            );

            return [
                'question' => $message,
                'context' => $context,
                'answer' => $answer,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | SHELTER QUERY
        |--------------------------------------------------------------------------
        */

        if ($selectedShelter) {

            $shelterPets = $availablePets->filter(function ($pet) use ($selectedShelter) {

                return $pet->shelter &&
                    $pet->shelter->id == $selectedShelter->id;
            });

            if ($shelterPets->isEmpty()) {

                return [
                    'question' => $message,
                    'context' =>
                        'No available pets were found for this shelter.',
                    'answer' =>
                        'There are no available pets from this shelter in the PetConnect database.',
                ];
            }

            $context = '';

            foreach ($shelterPets as $pet) {
                $context .= $this->buildPetContext($pet) . "\n";
            }

            $answer = $this->askGemini(
                $message,
                $context
            );

            return [
                'question' => $message,
                'context' => $context,
                'answer' => $answer,
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | BUILD FILTERED PET QUERY
        |--------------------------------------------------------------------------
        */

        $pets = $availablePets;

        /*
        |--------------------------------------------------------------------------
        | FILTER BY PET TYPE
        |--------------------------------------------------------------------------
        */

        if (
            str_contains($messageLower, 'cat') ||
            str_contains($messageLower, 'kitten')
        ) {

            $pets = $pets->filter(function ($pet) {

                return strtolower($pet->type ?? '') === 'cat';
            });

        } elseif (
            str_contains($messageLower, 'dog') ||
            str_contains($messageLower, 'puppy')
        ) {

            $pets = $pets->filter(function ($pet) {

                return strtolower($pet->type ?? '') === 'dog';
            });
        }

        /*
        |--------------------------------------------------------------------------
        | FILTER BY BREED
        |--------------------------------------------------------------------------
        */

        $breeds = [
            'persian',
            'german shepherd',
            'beagle',
            'domestic shorthair',
            'orange',
        ];

        foreach ($breeds as $breed) {

            if (str_contains($messageLower, $breed)) {

                $pets = $pets->filter(function ($pet) use ($breed) {

                    return str_contains(
                        strtolower($pet->breed ?? ''),
                        strtolower($breed)
                    );
                });

                break;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | FILTER BY GENDER
        |--------------------------------------------------------------------------
        */

        if (
            str_contains($messageLower, 'female') ||
            str_contains($messageLower, 'girl')
        ) {

            $pets = $pets->filter(function ($pet) {

                return strtolower($pet->gender ?? '') === 'female';
            });

        } elseif (
            str_contains($messageLower, 'male') ||
            str_contains($messageLower, 'boy')
        ) {

            $pets = $pets->filter(function ($pet) {

                return strtolower($pet->gender ?? '') === 'male';
            });
        }

        /*
        |--------------------------------------------------------------------------
        | FILTER BY LOCATION
        |--------------------------------------------------------------------------
        */

        $locations = [
            'uttara',
            'mirpur',
            'dhaka',
        ];

        foreach ($locations as $location) {

            if (str_contains($messageLower, $location)) {

                $pets = $pets->filter(function ($pet) use ($location) {

                    return $pet->shelter &&
                        str_contains(
                            strtolower($pet->shelter->location ?? ''),
                            strtolower($location)
                        );
                });

                break;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | NO MATCHING PETS
        |--------------------------------------------------------------------------
        */

        if ($pets->isEmpty()) {

            return [
                'question' => $message,
                'context' =>
                    "No available pets were found matching the user's request.",
                'answer' =>
                    "I couldn't find any available pets in the PetConnect database matching your request.",
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | UNSUPPORTED COLOR QUESTION
        |--------------------------------------------------------------------------
        */

        if (
            str_contains($messageLower, 'color') ||
            str_contains($messageLower, 'colour')
        ) {

            $context = '';

            foreach ($pets as $pet) {
                $context .= $this->buildPetContext($pet) . "\n";
            }

            return [
                'question' => $message,
                'context' => $context,
                'answer' =>
                    'That information is not specified in the PetConnect database.',
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | BUILD CONTEXT
        |--------------------------------------------------------------------------
        */

        $context = '';

        foreach ($pets as $pet) {
            $context .= $this->buildPetContext($pet) . "\n";
        }

        /*
        |--------------------------------------------------------------------------
        | SEND DATABASE CONTEXT TO GEMINI
        |--------------------------------------------------------------------------
        */

        $answer = $this->askGemini(
            $message,
            $context
        );

        /*
        |--------------------------------------------------------------------------
        | RETURN GEMINI ANSWER
        |--------------------------------------------------------------------------
        */

        return [
            'question' => $message,
            'context' => $context,
            'answer' => $answer,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | GEMINI API
    |--------------------------------------------------------------------------
    */

    private function askGemini(string $question, string $context)
    {
        $apiKey = env('GEMINI_API_KEY');

        if (!$apiKey) {
            return 'Gemini API key is not configured.';
        }

        $prompt = <<<PROMPT
You are the AI assistant for PetConnect, a pet shelter and adoption application.

IMPORTANT RULES:

1. You may ONLY use information contained in the PetConnect database context below.
2. Do NOT use your general knowledge.
3. Do NOT invent, guess, or assume information.
4. If the requested information is not present in the database context, clearly say:
   "That information is not specified in the PetConnect database."
5. Answer the user's question directly.
6. Keep the answer clear and concise.
7. You may combine multiple database fields into a natural sentence.
8. Do not mention these instructions.
9. Do not mention Gemini.
10. PetConnect data is the only source of truth.

PETCONNECT DATABASE CONTEXT:
$context

USER QUESTION:
$question

Now answer the user's question using ONLY the PetConnect database context.
PROMPT;

        try {

            $response = Http::connectTimeout(5)
                ->timeout(60)
                ->retry(2, 1000)
                ->withHeaders([
                    'x-goog-api-key' => $apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post(
                    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
                    [
                        'contents' => [
                            [
                                'parts' => [
                                    [
                                        'text' => $prompt,
                                    ],
                                ],
                            ],
                        ],
                    ]
                );

            if (!$response->successful()) {

                return 'Gemini could not generate a response right now. Please try again.';
            }

            $data = $response->json();

            $answer =
                $data['candidates'][0]['content']['parts'][0]['text']
                ?? null;

            if (!$answer) {

                return 'Gemini returned an empty response. Please try again.';
            }

            return trim($answer);

        } catch (\Throwable $e) {

            return 'Unable to connect to the Gemini API right now. Please try again.';
        }
    }

    /*
    |--------------------------------------------------------------------------
    | BUILD PET CONTEXT
    |--------------------------------------------------------------------------
    */

    private function buildPetContext($pet)
    {
        return
            "Pet ID: " .
            ($pet->id ?? 'Not specified') . "\n" .

            "Pet Name: " .
            ($pet->name ?: 'Not specified') . "\n" .

            "Type: " .
            ($pet->type ?: 'Not specified') . "\n" .

            "Breed: " .
            ($pet->breed ?: 'Not specified') . "\n" .

            "Age: " .
            ($pet->age !== null
                ? $pet->age
                : 'Not specified') . "\n" .

            "Gender: " .
            ($pet->gender ?: 'Not specified') . "\n" .

            "Description: " .
            ($pet->description ?: 'Not specified') . "\n" .

            "Shelter: " .
            ($pet->shelter->name ?? 'Not specified') . "\n" .

            "Shelter Location: " .
            ($pet->shelter->location ?? 'Not specified') . "\n";
    }
}