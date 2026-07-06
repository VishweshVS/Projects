import pandas as pd
from src.generator import generate_reply
from src.evaluvator import evaluate_response

def main():
    # Load dataset
    df = pd.read_csv("data/emails_dataset.csv")
    
    # Storage for evaluation results
    scores = []
    hallucinations = []
    ai_replies = []
    
    print(f"Processing {len(df)} test cases...")
    
    for idx, row in df.iterrows():
        # Step 1: Generate AI response
        reply = generate_reply(row['customer_email'], row['ground_truth_context'])
        ai_replies.append(reply)
        
        # Step 2: Evaluate accuracy
        eval_result = evaluate_response(row['ground_truth_context'], reply)
        scores.append(eval_result['accuracy_score'])
        hallucinations.append(eval_result['hallucination_detected'])
        
    # Append results back to the dataframe
    df['generated_reply'] = ai_replies
    df['accuracy_score'] = scores
    df['hallucination_detected'] = hallucinations
    
    # Save results
    df.to_csv("data/evaluation_results.csv", index=False)
    print("Evaluation complete! Results saved to data/evaluation_results.csv")
    print(f"Average Accuracy Score: {df['accuracy_score'].mean()}%")

if __name__ == "__main__":
    main()