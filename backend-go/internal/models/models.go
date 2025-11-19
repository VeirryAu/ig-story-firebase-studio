package models

import (
	"database/sql"
	"encoding/json"
)

type UserRecapRow struct {
	UserID                  uint32
	UserName                string
	TrxCount               uint32
	VariantCount           sql.NullInt64
	TotalPoint             sql.NullInt64
	TotalPointDescription  sql.NullString
	TotalPointPossibleRedeem sql.NullInt64
	TotalPointImage        sql.NullString
	DeliveryCount          sql.NullInt64
	PickupCount            sql.NullInt64
	CheaperSubsDesc        sql.NullString
	CheaperSubsAmount      sql.NullFloat64
	TopRanking             sql.NullInt64
	ListCircularImages     sql.NullString
	ListProductFavorite    sql.NullString
	ListFavoriteStore      sql.NullString
}

type ServerResponse struct {
	UserName                string        `json:"userName"`
	TrxCount                uint32        `json:"trxCount"`
	VariantCount            *int64        `json:"variantCount,omitempty"`
	TotalPoint              *int64        `json:"totalPoint,omitempty"`
	TotalPointDescription   *string       `json:"totalPointDescription,omitempty"`
	TotalPointPossibleRedeem *int64       `json:"totalPointPossibleRedeem,omitempty"`
	TotalPointImage         *string       `json:"totalPointImage,omitempty"`
	DeliveryCount           *int64        `json:"deliveryCount,omitempty"`
	PickupCount             *int64        `json:"pickupCount,omitempty"`
	CheaperSubsDesc         *string       `json:"cheaperSubsDesc,omitempty"`
	CheaperSubsAmount       *float64      `json:"cheaperSubsAmount,omitempty"`
	TopRanking              *int64        `json:"topRanking,omitempty"`
	ListCircularImages      []string      `json:"listCircularImages,omitempty"`
	ListProductFavorite     interface{}   `json:"listProductFavorite,omitempty"`
	ListFavoriteStore       interface{}   `json:"listFavoriteStore,omitempty"`
}

func (r *UserRecapRow) ToResponse() ServerResponse {
	resp := ServerResponse{
		UserName:  r.UserName,
		TrxCount:  r.TrxCount,
	}

	if r.VariantCount.Valid {
		val := r.VariantCount.Int64
		resp.VariantCount = &val
	}
	if r.TotalPoint.Valid {
		val := r.TotalPoint.Int64
		resp.TotalPoint = &val
	}
	if r.TotalPointDescription.Valid {
		val := r.TotalPointDescription.String
		resp.TotalPointDescription = &val
	}
	if r.TotalPointPossibleRedeem.Valid {
		val := r.TotalPointPossibleRedeem.Int64
		resp.TotalPointPossibleRedeem = &val
	}
	if r.TotalPointImage.Valid {
		val := r.TotalPointImage.String
		resp.TotalPointImage = &val
	}
	if r.DeliveryCount.Valid {
		val := r.DeliveryCount.Int64
		resp.DeliveryCount = &val
	}
	if r.PickupCount.Valid {
		val := r.PickupCount.Int64
		resp.PickupCount = &val
	}
	if r.CheaperSubsDesc.Valid {
		val := r.CheaperSubsDesc.String
		resp.CheaperSubsDesc = &val
	}
	if r.CheaperSubsAmount.Valid {
		val := r.CheaperSubsAmount.Float64
		resp.CheaperSubsAmount = &val
	}
	if r.TopRanking.Valid {
		val := r.TopRanking.Int64
		resp.TopRanking = &val
	}

	if r.ListCircularImages.Valid {
		var arr []string
		if err := json.Unmarshal([]byte(r.ListCircularImages.String), &arr); err == nil {
			resp.ListCircularImages = arr
		}
	}
	if r.ListProductFavorite.Valid {
		var raw interface{}
		if err := json.Unmarshal([]byte(r.ListProductFavorite.String), &raw); err == nil {
			resp.ListProductFavorite = raw
		}
	}
	if r.ListFavoriteStore.Valid {
		var raw interface{}
		if err := json.Unmarshal([]byte(r.ListFavoriteStore.String), &raw); err == nil {
			resp.ListFavoriteStore = raw
		}
	}

	return resp
}


