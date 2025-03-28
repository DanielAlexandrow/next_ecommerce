<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => [
                'id' => $this->id,
                'username' => $this->username,
                'name' => $this->name,
                'email' => $this->email,
                'role' => $this->role,
                'isAdmin' => $this->isAdmin(),
                'avatar' => $this->avatar(),
                'acronym' => $this->createAcronym($this->name),
                'status' => $this->hasVerifiedEmail() ? 'Verified' : 'Unverified',
                'joined' => $this->created_at->format('j M Y, g:i a'),
            ]
        ];
    }

    protected function createAcronym($string): ?string
    {
        $output = null;
        $token = strtok($string, ' ');
        while ($token !== false) {
            $output .= $token[0];
            $token = strtok(' ');
        }

        return $output;
    }
}
