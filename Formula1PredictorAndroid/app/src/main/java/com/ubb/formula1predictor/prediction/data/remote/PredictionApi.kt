package com.ubb.formula1predictor.prediction.data.remote

import com.ubb.formula1predictor.core.Api
import com.ubb.formula1predictor.prediction.data.Prediction
import retrofit2.http.*

object PredictionApi {
    interface Service {
        @GET("/pred/prediction")
        suspend fun find(): List<Prediction>

        @GET("/pred/prediction/{id}")
        suspend fun read(@Path("id") predictionId: String): Prediction;

        @Headers("Content-Type: application/json")
        @POST("/pred/prediction")
        suspend fun create(): Prediction

        @Headers("Content-Type: application/json")
        @PUT("/pred/prediction/{id}")
        suspend fun update(@Path("id") predictionId: String, @Body prediction: Prediction): Prediction
    }

    val service: Service = Api.retrofit.create(Service::class.java)
}