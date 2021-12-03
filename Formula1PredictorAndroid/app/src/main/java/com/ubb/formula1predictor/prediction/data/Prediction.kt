package com.ubb.formula1predictor.prediction.data

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.ArrayList

@Entity(tableName = "predictions")
data class Prediction(
    @PrimaryKey @ColumnInfo(name = "_id") val _id: String,
    @ColumnInfo(name = "name") var name: String,
    @ColumnInfo(name = "driverOrder") var driverOrder: ArrayList<String>
) {
    override fun toString(): String = "$name - $driverOrder"
}
