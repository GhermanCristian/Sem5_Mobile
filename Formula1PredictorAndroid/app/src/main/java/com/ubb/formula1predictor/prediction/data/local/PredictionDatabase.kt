package com.ubb.formula1predictor.prediction.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.ubb.formula1predictor.prediction.data.Prediction

@Database(entities = [Prediction::class], version = 1)
@TypeConverters(Converters::class)
abstract class PredictionDatabase : RoomDatabase() {

    abstract fun predictionDao(): PredictionDao

    companion object {
        @Volatile
        private var INSTANCE: PredictionDatabase? = null

        fun getDatabase(context: Context): PredictionDatabase {
            val inst = INSTANCE
            if (inst != null) {
                return inst
            }
            val instance = Room.databaseBuilder(context.applicationContext, PredictionDatabase::class.java, "prediction_db")
                                .build()
            INSTANCE = instance
            return instance
        }
    }
}
