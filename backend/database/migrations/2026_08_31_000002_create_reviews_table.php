<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
|==============================================================================
| REVIEWS   -   the `review` entity from the ER diagram
|==============================================================================
|
| The diagram says:
|
|     user  ──1:m── writes ──► review ──m:1── receive ──► shelter
|
| Read as two sentences:
|     one user WRITES many reviews
|     one shelter RECEIVES many reviews
|
| So a review sits BETWEEN a user and a shelter, and carries both ids.
|
| WHERE DO THE FOREIGN KEYS GO?
| The rule never changes: the key lives on the MANY side. Both relationships
| have `review` as the many side, so BOTH keys live on this table. That is
| also why a review cannot be a column on users or on shelters - it belongs
| to a pair of them, not to either one alone.
|
| This is the same shape as adoption_request in the diagram, which links a
| user to a pet. A table whose job is to connect two others is called a
| JUNCTION table (also bridge, or linking table).
|
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            // review_id in the diagram; `id` here, matching every other table.
            $table->id();

            /*
            | The two links.
            |
            | cascadeOnDelete on both: a review of a shelter that no longer
            | exists, or by a user who no longer exists, is meaningless - there
            | is nothing for it to be a review OF, or BY. Compare this with
            | shelters.admin_id, which uses SET NULL because a shelter without
            | an admin still makes perfect sense.
            |
            | Choosing between CASCADE and SET NULL is not a style question:
            | ask whether the row still means anything once the parent is gone.
            */
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shelter_id')->constrained()->cascadeOnDelete();

            /*
            | unsignedTinyInteger holds 0-255 and cannot go negative, which is
            | already most of what a 1-5 rating needs. The exact 1-5 range is
            | enforced by validation in the controller.
            */
            $table->unsignedTinyInteger('rating');

            $table->text('comment')->nullable();

            // `date` in the diagram. timestamps() gives created_at, which is
            // the same fact and is filled in automatically.
            $table->timestamps();

            /*
            | One review per person per shelter.
            |
            | Neither column is unique on its own - a user may review many
            | shelters, and a shelter may be reviewed by many users - but the
            | PAIR must be unique. That is a COMPOSITE UNIQUE constraint, and
            | it is what stops one person leaving ten five-star reviews.
            */
            $table->unique(['user_id', 'shelter_id']);

            /*
            | The shelter page constantly runs
            |     SELECT ... FROM reviews WHERE shelter_id = ?
            | so an index on that column turns a full table scan into a direct
            | lookup.
            */
            $table->index('shelter_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
