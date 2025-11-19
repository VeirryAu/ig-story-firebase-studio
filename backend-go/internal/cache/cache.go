package cache

import (
	"context"
	"encoding/json"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/forecap/forecap-2025/backend-go/internal/models"
)

const cacheKeyPrefix = "user:recap:"

type Client struct {
	redis   *redis.Client
	ttl     time.Duration
}

func NewClient(rdb *redis.Client, ttl time.Duration) *Client {
	return &Client{
		redis: rdb,
		ttl:   ttl,
	}
}

func (c *Client) GetUser(ctx context.Context, userID uint32) (*models.ServerResponse, error) {
	key := cacheKeyPrefix + (fmtUint32(userID))
	result, err := c.redis.Get(ctx, key).Result()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	var resp models.ServerResponse
	if err := json.Unmarshal([]byte(result), &resp); err != nil {
		return nil, err
	}
	return &resp, nil
}

func (c *Client) SetUser(ctx context.Context, userID uint32, data models.ServerResponse) error {
	key := cacheKeyPrefix + fmtUint32(userID)
	payload, err := json.Marshal(data)
	if err != nil {
		return err
	}
	return c.redis.Set(ctx, key, payload, c.ttl).Err()
}

func fmtUint32(v uint32) string {
	return strconv.FormatUint(uint64(v), 10)
}

func (c *Client) Ping(ctx context.Context) error {
	return c.redis.Ping(ctx).Err()
}


