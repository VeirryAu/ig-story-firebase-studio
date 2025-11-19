import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mysql from 'mysql2/promise';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: mysql.Pool;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.pool = mysql.createPool({
      host: this.configService.get('MYSQL_HOST', 'localhost'),
      database: this.configService.get('MYSQL_DATABASE', 'forecap_db'),
      user: this.configService.get('MYSQL_USER', 'root'),
      password: this.configService.get('MYSQL_PASSWORD', ''),
      waitForConnections: true,
      connectionLimit: parseInt(
        this.configService.get('MYSQL_CONNECTION_LIMIT', '20'),
      ),
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  getPool(): mysql.Pool {
    return this.pool;
  }

  /**
   * Get user recap data - single query with JSON parsing in app
   */
  async getUserRecap(userId: number): Promise<any> {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT 
          user_id,
          user_name as userName,
          trx_count as trxCount,
          variant_count as variantCount,
          total_point as totalPoint,
          total_point_description as totalPointDescription,
          total_point_possible_redeem as totalPointPossibleRedeem,
          total_point_image as totalPointImage,
          delivery_count as deliveryCount,
          pickup_count as pickupCount,
          cheaper_subs_desc as cheaperSubsDesc,
          cheaper_subs_amount as cheaperSubsAmount,
          top_ranking as topRanking,
          list_circular_images as listCircularImages,
          list_product_favorite as listProductFavorite,
          list_favorite_store as listFavoriteStore
        FROM user_recap_data
        WHERE user_id = ?`,
        [userId],
      );

      const userData = (rows as any[])[0];
      if (!userData) {
        return null;
      }

      // Parse JSON fields in application layer (faster than MySQL JSON functions)
      if (userData.listCircularImages) {
        try {
          userData.listCircularImages =
            typeof userData.listCircularImages === 'string'
              ? JSON.parse(userData.listCircularImages)
              : userData.listCircularImages;
        } catch {
          userData.listCircularImages = null;
        }
      }

      if (userData.listProductFavorite) {
        try {
          userData.listProductFavorite =
            typeof userData.listProductFavorite === 'string'
              ? JSON.parse(userData.listProductFavorite)
              : userData.listProductFavorite;
        } catch {
          userData.listProductFavorite = [];
        }
      }

      if (userData.listFavoriteStore) {
        try {
          userData.listFavoriteStore =
            typeof userData.listFavoriteStore === 'string'
              ? JSON.parse(userData.listFavoriteStore)
              : userData.listFavoriteStore;
        } catch {
          userData.listFavoriteStore = [];
        }
      }

      return userData;
    } finally {
      connection.release();
    }
  }

  /**
   * Batch insert user recap data - single table insert
   */
  async batchInsertUserRecap(
    users: Array<{
      user_id: number;
      user_name: string;
      trx_count: number;
      variant_count?: number;
      total_point?: number;
      total_point_description?: string;
      total_point_possible_redeem?: number;
      total_point_image?: string;
      delivery_count?: number;
      pickup_count?: number;
      cheaper_subs_desc?: string;
      cheaper_subs_amount?: number;
      top_ranking?: number;
      list_circular_images?: any;
      list_product_favorite?: any;
      list_favorite_store?: any;
    }>,
  ): Promise<number> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      let inserted = 0;
      for (const user of users) {
        // Serialize JSON fields in application layer
        const listCircularImagesJson = user.list_circular_images
          ? JSON.stringify(user.list_circular_images)
          : null;
        const listProductFavoriteJson = user.list_product_favorite
          ? JSON.stringify(user.list_product_favorite)
          : null;
        const listFavoriteStoreJson = user.list_favorite_store
          ? JSON.stringify(user.list_favorite_store)
          : null;

        await connection.execute(
          `INSERT INTO user_recap_data (
            user_id, user_name, trx_count, variant_count,
            total_point, total_point_description, total_point_possible_redeem,
            total_point_image, delivery_count, pickup_count,
            cheaper_subs_desc, cheaper_subs_amount, top_ranking,
            list_circular_images, list_product_favorite, list_favorite_store
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            user_name = VALUES(user_name),
            trx_count = VALUES(trx_count),
            variant_count = VALUES(variant_count),
            total_point = VALUES(total_point),
            total_point_description = VALUES(total_point_description),
            total_point_possible_redeem = VALUES(total_point_possible_redeem),
            total_point_image = VALUES(total_point_image),
            delivery_count = VALUES(delivery_count),
            pickup_count = VALUES(pickup_count),
            cheaper_subs_desc = VALUES(cheaper_subs_desc),
            cheaper_subs_amount = VALUES(cheaper_subs_amount),
            top_ranking = VALUES(top_ranking),
            list_circular_images = VALUES(list_circular_images),
            list_product_favorite = VALUES(list_product_favorite),
            list_favorite_store = VALUES(list_favorite_store),
            updated_at = CURRENT_TIMESTAMP`,
          [
            user.user_id,
            user.user_name,
            user.trx_count,
            user.variant_count || null,
            user.total_point || null,
            user.total_point_description || null,
            user.total_point_possible_redeem || null,
            user.total_point_image || null,
            user.delivery_count || null,
            user.pickup_count || null,
            user.cheaper_subs_desc || null,
            user.cheaper_subs_amount || null,
            user.top_ranking || null,
            listCircularImagesJson,
            listProductFavoriteJson,
            listFavoriteStoreJson,
          ],
        );
        inserted++;
      }

      await connection.commit();
      return inserted;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
