from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import tensorflow as tf
from io import BytesIO
from keras.models import load_model
import numpy as np
from pydantic import BaseModel
from sklearn.preprocessing import MinMaxScaler
import joblib


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model


def load_my_model():
    return load_model("customer_churn_model.h5")


model = load_my_model()


@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(BytesIO(contents))

    feature_cols = [
        "gender", "SeniorCitizen", "Partner", "Dependents",
        "tenure", "PhoneService", "MultipleLines",
        "OnlineSecurity", "OnlineBackup", "DeviceProtection",
        "TechSupport", "StreamingTV", "StreamingMovies",
        "PaperlessBilling", "MonthlyCharges", "TotalCharges",
        "InternetService_DSL", "InternetService_Fiber optic",
        "InternetService_No", "Contract_Month-to-month",
        "Contract_One year", "Contract_Two year",
        "PaymentMethod_Bank transfer (automatic)", "PaymentMethod_Credit card (automatic)",
        "PaymentMethod_Electronic check", "PaymentMethod_Mailed check"
    ]

    # Lấy dữ liệu đầu vào
    X = df[feature_cols]

    # Dự đoán xác suất churn
    probs = model.predict(X)        # dạng mảng xác suất (0–1)
    probs = probs.flatten() if isinstance(probs, np.ndarray) else probs

    # Gán churn True/False
    churn_flags = [bool(p > 0.5) for p in probs]

    # Gộp kết quả vào DataFrame mới
    result_df = df.copy()
    result_df["id"] = range(1, len(df) + 1)
    result_df["churn"] = churn_flags
    result_df["churn_probability"] = probs

    # Chọn cột theo yêu cầu: id + 26 trường gốc + churn + churn_probability
    output_cols = ["id"] + feature_cols + ["churn", "churn_probability"]
    output = result_df[output_cols].to_dict(orient="records")

    return output


class CustomerInput(BaseModel):
    tenure: float
    monthlyCharges: float
    totalCharges: float
    gender: int
    seniorCitizen: int
    partner: int
    dependents: int
    phoneService: int
    multipleLines: int
    onlineSecurity: int
    onlineBackup: int
    deviceProtection: int
    techSupport: int
    streamingTv: int
    streamingMovies: int
    paperlessBilling: int
    contract_monthToMonth: int
    contract_oneYear: int
    contract_twoYear: int
    internetService_dsl: int
    internetService_fiberOptic: int
    internetService_no: int
    paymentMethod_bankTransferAutomatic: int
    paymentMethod_creditCardAutomatic: int
    paymentMethod_electronicCheck: int
    paymentMethod_mailedCheck: int


@app.post("/single-customer")
async def single_customer(customer: CustomerInput):
    columns_order = [
        "gender", "SeniorCitizen", "Partner", "Dependents", "tenure",
        "PhoneService", "MultipleLines", "OnlineSecurity", "OnlineBackup",
        "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies",
        "PaperlessBilling", "MonthlyCharges", "TotalCharges",
        "InternetService_DSL", "InternetService_Fiber optic", "InternetService_No",
        "Contract_Month-to-month", "Contract_One year", "Contract_Two year",
        "PaymentMethod_Bank transfer (automatic)", "PaymentMethod_Credit card (automatic)",
        "PaymentMethod_Electronic check", "PaymentMethod_Mailed check"
    ]

    TENURE_MIN, TENURE_MAX = 0.0, 72.0
    MONTHLY_MIN, MONTHLY_MAX = 19.0, 116.0
    TOTAL_MIN, TOTAL_MAX = 19.0, 8405.0

    tenure_scaled = (customer.tenure - TENURE_MIN) / (TENURE_MAX - TENURE_MIN)
    monthly_scaled = (customer.monthlyCharges - MONTHLY_MIN) / \
        (MONTHLY_MAX - MONTHLY_MIN)
    total_scaled = (customer.totalCharges - TOTAL_MIN) / \
        (TOTAL_MAX - TOTAL_MIN)

    values_map = {
        "gender": customer.gender,
        "SeniorCitizen": customer.seniorCitizen,
        "Partner": customer.partner,
        "Dependents": customer.dependents,
        "tenure": tenure_scaled,
        "PhoneService": customer.phoneService,
        "MultipleLines": customer.multipleLines,
        "OnlineSecurity": customer.onlineSecurity,
        "OnlineBackup": customer.onlineBackup,
        "DeviceProtection": customer.deviceProtection,
        "TechSupport": customer.techSupport,
        "StreamingTV": customer.streamingTv,
        "StreamingMovies": customer.streamingMovies,
        "PaperlessBilling": customer.paperlessBilling,
        "MonthlyCharges": monthly_scaled,
        "TotalCharges": total_scaled,
        "InternetService_DSL": customer.internetService_dsl,
        "InternetService_Fiber optic": customer.internetService_fiberOptic,
        "InternetService_No": customer.internetService_no,
        "Contract_Month-to-month": customer.contract_monthToMonth,
        "Contract_One year": customer.contract_oneYear,
        "Contract_Two year": customer.contract_twoYear,
        "PaymentMethod_Bank transfer (automatic)": customer.paymentMethod_bankTransferAutomatic,
        "PaymentMethod_Credit card (automatic)": customer.paymentMethod_creditCardAutomatic,
        "PaymentMethod_Electronic check": customer.paymentMethod_electronicCheck,
        "PaymentMethod_Mailed check": customer.paymentMethod_mailedCheck,
    }

    df = pd.DataFrame([[values_map[col]
                      for col in columns_order]], columns=columns_order)

    pred_prob = model.predict(df)[0][0]
    pred_label = bool(pred_prob > 0.5)

    result = {
        "id": 1,
        "churn": pred_label,
        "churn_probability": round(float(pred_prob), 4)
    }
    for col in columns_order:
        result[col] = values_map[col]

    return result
