import streamlit as st
import requests

st.set_page_config(page_title="ATS Resume Screener", page_icon="📄", layout="wide")

st.title("📄 Resume Screening & ATS Optimization Tool")
st.markdown("Optimize your resume match score using Semantic NLP Embeddings & Skill Extraction.")

API_URL = "http://127.0.0.1:8000/api/v1"

col1, col2 = st.columns(2)

with col1:
    st.subheader("1. Job Description")
    jd_input = st.text_area("Paste the Job Description here:", height=250)

with col2:
    st.subheader("2. Candidate Resume")
    upload_option = st.radio("Choose upload method:", ("PDF File", "Paste Text"))
    
    resume_text = ""
    uploaded_file = None
    
    if upload_option == "PDF File":
        uploaded_file = st.file_uploader("Upload Resume PDF", type=["pdf"])
    else:
        resume_text = st.text_area("Paste Resume Text here:", height=200)

if st.button("🚀 Analyze & Match Score", type="primary"):
    if not jd_input.strip():
        st.error("Please provide a Job Description.")
    elif upload_option == "PDF File" and not uploaded_file:
        st.error("Please upload a PDF Resume.")
    elif upload_option == "Paste Text" and not resume_text.strip():
        st.error("Please paste the Resume text.")
    else:
        with st.spinner("Processing text and computing contextual similarity..."):
            try:
                if upload_option == "PDF File":
                    uploaded_file.seek(0)
                    files = {"file": (uploaded_file.name, uploaded_file.read(), "application/pdf")}
                    data = {"job_description": jd_input}
                    res = requests.post(f"{API_URL}/screen-file", data=data, files=files, timeout=30)
                else:
                    payload = {"job_description": jd_input, "resume_text": resume_text}
                    res = requests.post(f"{API_URL}/screen", json=payload, timeout=30)
                
                if res.status_code == 200:
                    result = res.json()
                    st.success("Analysis Complete!")
                    
                    st.metric("Overall Match Score", f"{result['overall_score']}%")
                    
                    st.subheader("Detailed Breakdown")
                    d_cols = st.columns(4)
                    detailed = result.get("detailed_scores", {})
                    d_cols[0].metric("Semantic Match", f"{detailed.get('semantic_score', 0)}%")
                    d_cols[1].metric("Skill Match", f"{detailed.get('skill_score', 0)}%")
                    d_cols[2].metric("Experience Match", f"{detailed.get('experience_score', 0)}%")
                    d_cols[3].metric("Education Match", f"{detailed.get('education_score', 0)}%")
                    
                    st.subheader("Skill Insights")
                    skills = result.get("skills", {})
                    matched = skills.get("matched_skills", [])
                    missing = skills.get("missing_skills", [])
                    
                    sc1, sc2 = st.columns(2)
                    sc1.write("✅ **Matched Skills:** " + (", ".join(matched) if matched else "None detected"))
                    sc2.write("❌ **Missing Skills:** " + (", ".join(missing) if missing else "None detected"))
                    
                    st.subheader("💡 Recommendations to Improve ATS Score")
                    recs = result.get("recommendations", [])
                    if recs:
                        for rec in recs:
                            st.info(f"• {rec}")
                    else:
                        st.success("🎉 Strong alignment detected across skills and experience!")
                else:
                    st.error(f"API Error ({res.status_code}): {res.text}")
            except requests.exceptions.ConnectionError:
                st.error(f"Connection Failed: Cannot reach FastAPI server at `{API_URL}`. Ensure `uvicorn app.main:app` is running.")
            except Exception as e:
                st.error(f"An unexpected error occurred: {e}")