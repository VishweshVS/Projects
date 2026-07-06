import streamlit as st
import pandas as pd
import os
from src.generator import generate_reply
from src.evaluvator import evaluate_response

st.set_page_config(page_title="Gen-AI Email Evaluator", layout="wide")

st.title("🎯 Gen-AI Email Response & Evaluation Dashboard")
st.write("Upload your customer email dataset to generate replies and audit their accuracy in real-time.")

# 1. File Uploader
uploaded_file = st.file_uploader("Upload your Dataset (CSV)", type=["csv"])

if uploaded_file is not None:
    df = pd.read_csv(uploaded_file)
    st.success(f"Loaded {len(df)} rows successfully!")
    
    # Preview data
    with st.expander("Preview Uploaded Data"):
        st.dataframe(df.head())
        
    # 2. Run Pipeline Button
    if st.button("🚀 Run Evaluation Pipeline", type="primary"):
        ai_replies = []
        scores = []
        hallucinations = []
        
        # Progress UI elements
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        for idx, row in df.iterrows():
            status_text.text(f"Processing row {idx+1}/{len(df)}...")
            
            # Generate & Evaluate
            reply = generate_reply(row['customer_email'], row['ground_truth_context'])
            eval_result = evaluate_response(row['ground_truth_context'], reply)
            
            ai_replies.append(reply)
            scores.append(eval_result['accuracy_score'])
            hallucinations.append(eval_result['hallucination_detected'])
            
            # Update progress bar
            progress_bar.progress((idx + 1) / len(df))
            
        # Add data back to dataframe
        df['generated_reply'] = ai_replies
        df['accuracy_score'] = scores
        df['hallucination_detected'] = hallucinations
        
        status_text.text("✨ Evaluation Complete!")
        
        # 3. High-Level Metrics Layout
        st.write("---")
        st.header("📊 Global Performance Metrics")
        col1, col2, col3 = st.columns(3)
        
        avg_score = df['accuracy_score'].mean()
        total_hallucinations = df['hallucination_detected'].sum()
        
        col1.metric("Avg Factual Accuracy", f"{avg_score:.1f}%")
        col2.metric("Total Hallucinations Detected", f"{total_hallucinations}")
        col3.metric("Pass Rate (>90% Score)", f"{(df['accuracy_score'] >= 90).sum() / len(df) * 100:.1f}%")
        
        # 4. Detailed Interactive Results Table
        st.write("---")
        st.header("🔍 Row-by-Row Breakdown")
        st.dataframe(df[['customer_email', 'generated_reply', 'accuracy_score', 'hallucination_detected']])
        
        # Download button for new dataset
        csv_data = df.to_csv(index=False).encode('utf-8')
        st.download_button("📥 Download Results CSV", data=csv_data, file_name="evaluation_results.csv", mime="text/csv")