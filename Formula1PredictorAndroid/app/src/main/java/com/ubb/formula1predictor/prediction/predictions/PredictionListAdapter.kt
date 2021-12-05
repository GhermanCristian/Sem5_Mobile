package com.ubb.formula1predictor.prediction.predictions

import android.annotation.SuppressLint
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.RecyclerView
import com.ubb.formula1predictor.R
import com.ubb.formula1predictor.core.TAG
import com.ubb.formula1predictor.prediction.data.Prediction
import com.ubb.formula1predictor.prediction.prediction.PredictionEditFragment

class PredictionListAdapter(
    private val fragment: Fragment,
) : RecyclerView.Adapter<PredictionListAdapter.ViewHolder>() {

    var predictions = emptyList<Prediction>()
        @SuppressLint("NotifyDataSetChanged")
        set(value) {
            field = value
            notifyDataSetChanged()
        }

    private var onPredictionClick: View.OnClickListener = View.OnClickListener { view ->
        val prediction = view.tag as Prediction
        fragment.findNavController().navigate(R.id.PredictionEditFragment, Bundle().apply {
            putString(PredictionEditFragment.PREDICTION_ID, prediction._id)
        })
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.view_prediction, parent, false)
        Log.v(TAG, "onCreateViewHolder")
        return ViewHolder(view)
    }

    @SuppressLint("SetTextI18n")  // some warning when setting the text
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        Log.v(TAG, "onBindViewHolder $position")
        val prediction = predictions[position]
        holder.textView.text = "${prediction.name} -> ${prediction.driverOrder[0]}"
        holder.itemView.tag = prediction
        holder.itemView.setOnClickListener(onPredictionClick)
    }

    override fun getItemCount() = predictions.size

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val textView: TextView = view.findViewById(R.id.text)

    }
}
