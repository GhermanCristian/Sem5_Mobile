package com.ubb.formula1predictor.prediction.prediction

import android.annotation.SuppressLint
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.ubb.formula1predictor.R
import com.ubb.formula1predictor.core.TAG

class DriverOrderAdapter : RecyclerView.Adapter<DriverOrderAdapter.ViewHolder>() {
    var driverOrder = arrayListOf<String>()
        set(value) {
            field = value
            notifyDataSetChanged()
        }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): DriverOrderAdapter.ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.view_driver, parent, false)
        Log.v(TAG, "onCreateViewHolder - driver order")
        return ViewHolder(view)
    }

    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val textView: TextView = view.findViewById(R.id.driver)
    }

    @SuppressLint("SetTextI18n") // some warning when setting the text
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        Log.v(TAG, "onBindViewHolder - driver order; $position")
        val driver = driverOrder[position]
        holder.textView.text = "${position + 1}. $driver"
        holder.itemView.tag = driver
    }

    override fun getItemCount(): Int = driverOrder.size
}