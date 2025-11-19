package auth

import (
	"encoding/base64"
	"errors"
	"net/http"
	"strconv"
	"time"
)

const maxAllowedSkew = 10 * time.Minute

var (
	ErrMissingHeader   = errors.New("missing authentication header")
	ErrInvalidUserID   = errors.New("invalid user_id")
	ErrInvalidTimestamp = errors.New("invalid timestamp")
	ErrExpiredTimestamp = errors.New("timestamp expired or too far in future")
	ErrInvalidSignature = errors.New("invalid signature")
)

type Validator struct {
	signatureSecret string
}

func NewValidator(secret string) *Validator {
	return &Validator{signatureSecret: secret}
}

func (v *Validator) ValidateHeaders(r *http.Request) (uint32, error) {
	timestamp := r.Header.Get("timestamp")
	if timestamp == "" {
		return 0, ErrMissingHeader
	}

	userIDRaw := r.Header.Get("user_id")
	if userIDRaw == "" {
		return 0, ErrMissingHeader
	}

	signature := r.Header.Get("sign")
	if signature == "" {
		return 0, ErrMissingHeader
	}

	userIDInt, err := strconv.ParseUint(userIDRaw, 10, 32)
	if err != nil {
		return 0, ErrInvalidUserID
	}

	if err := validateTimestamp(timestamp); err != nil {
		return 0, err
	}

	if err := v.validateSignature(timestamp, userIDRaw, signature); err != nil {
		return 0, err
	}

	return uint32(userIDInt), nil
}

func validateTimestamp(raw string) error {
	parsed, err := time.Parse(time.RFC3339, raw)
	if err != nil {
		return ErrInvalidTimestamp
	}
	diff := time.Since(parsed)
	if diff > maxAllowedSkew || diff < -maxAllowedSkew {
		return ErrExpiredTimestamp
	}
	return nil
}

func (v *Validator) validateSignature(timestamp, userID, provided string) error {
	payload := timestamp + userID
	if v.signatureSecret != "" {
		payload = timestamp + v.signatureSecret + userID
	}

	expected := base64.StdEncoding.EncodeToString([]byte(payload))
	if expected != provided {
		return ErrInvalidSignature
	}
	return nil
}


