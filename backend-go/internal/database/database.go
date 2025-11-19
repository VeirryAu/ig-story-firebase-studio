package database

import (
	"context"
	"database/sql"
	"time"

	_ "github.com/go-sql-driver/mysql"

	"github.com/forecap/forecap-2025/backend-go/internal/models"
)

type Client struct {
	db *sql.DB
}

func New(dsn string, maxOpen int) (*Client, error) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}
	
	// Connection pool settings
	db.SetMaxOpenConns(maxOpen)
	db.SetMaxIdleConns(maxOpen / 2)
	db.SetConnMaxLifetime(30 * time.Minute)
	// Set connection idle timeout to prevent stale connections
	db.SetConnMaxIdleTime(5 * time.Minute)

	// Test connection with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		return nil, err
	}

	return &Client{db: db}, nil
}

func (c *Client) Close() error {
	return c.db.Close()
}

func (c *Client) Ping(ctx context.Context) error {
	return c.db.PingContext(ctx)
}

const userRecapQuery = `
SELECT
  user_id,
  user_name,
  trx_count,
  variant_count,
  total_point,
  total_point_description,
  total_point_possible_redeem,
  total_point_image,
  delivery_count,
  pickup_count,
  cheaper_subs_desc,
  cheaper_subs_amount,
  top_ranking,
  list_circular_images,
  list_product_favorite,
  list_favorite_store
FROM user_recap_data
WHERE user_id = ?`

func (c *Client) GetUserRecap(ctx context.Context, userID uint32) (*models.UserRecapRow, error) {
	// Ensure context has timeout (defensive check)
	// If context already has timeout, this will use the shorter one
	queryCtx := ctx
	if _, hasDeadline := ctx.Deadline(); !hasDeadline {
		var cancel context.CancelFunc
		queryCtx, cancel = context.WithTimeout(ctx, 5*time.Second)
		defer cancel()
	}
	
	row := c.db.QueryRowContext(queryCtx, userRecapQuery, userID)

	var result models.UserRecapRow
	if err := row.Scan(
		&result.UserID,
		&result.UserName,
		&result.TrxCount,
		&result.VariantCount,
		&result.TotalPoint,
		&result.TotalPointDescription,
		&result.TotalPointPossibleRedeem,
		&result.TotalPointImage,
		&result.DeliveryCount,
		&result.PickupCount,
		&result.CheaperSubsDesc,
		&result.CheaperSubsAmount,
		&result.TopRanking,
		&result.ListCircularImages,
		&result.ListProductFavorite,
		&result.ListFavoriteStore,
	); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		// Check if error is due to context timeout
		if queryCtx.Err() == context.DeadlineExceeded {
			return nil, queryCtx.Err()
		}
		return nil, err
	}

	return &result, nil
}


