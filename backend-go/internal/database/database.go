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
	db.SetMaxOpenConns(maxOpen)
	db.SetMaxIdleConns(maxOpen / 2)
	db.SetConnMaxLifetime(30 * time.Minute)

	if err := db.Ping(); err != nil {
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
	row := c.db.QueryRowContext(ctx, userRecapQuery, userID)

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
		return nil, err
	}

	return &result, nil
}


