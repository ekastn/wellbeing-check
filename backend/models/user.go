package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name     string             `bson:"name" json:"name"`
	Email    string             `bson:"email" json:"email"`
	Password string             `bson:"password" json:"-"` // tidak pernah dikirim ke frontend
	Avatar   string             `bson:"avatar,omitempty" json:"avatar,omitempty"`
	Role     string             `bson:"role" json:"role"` // "manager" atau "member"
}
