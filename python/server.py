from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from io import BytesIO
from keras.models import load_model
import numpy as np
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_my_model():
    return load_model("customer_churn_model.h5")


model = load_my_model()

TENURE_MIN, TENURE_MAX = 0.0, 72.0
MONTHLY_MIN, MONTHLY_MAX = 19.0, 116.0
TOTAL_MIN, TOTAL_MAX = 19.0, 8405.0


@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(BytesIO(contents))

    df.replace('No internet service', 'No', inplace=True)
    df.replace('No phone service', 'No', inplace=True)

    # Yes/No -> 1/0
    yes_no_cols = [
        "Partner", "Dependents", "PhoneService", "MultipleLines",
        "OnlineSecurity", "OnlineBackup", "DeviceProtection", "TechSupport",
        "StreamingTV", "StreamingMovies", "PaperlessBilling"
    ]
    for col in yes_no_cols:
        df[col] = df[col].map(lambda x: 1 if str(
            x).strip().lower() == "yes" else 0).astype("int64")

    # Gender: Male=0, Female=1
    df["gender"] = df["gender"].map(lambda x: 0 if str(
        x).strip().lower() == "male" else 1).astype("int64")

    df["tenure"] = pd.to_numeric(
        df["tenure"], errors="coerce").astype("float64")
    df["MonthlyCharges"] = pd.to_numeric(
        df["MonthlyCharges"], errors="coerce").astype("float64")
    df["TotalCharges"] = pd.to_numeric(
        df["TotalCharges"], errors="coerce").astype("float64")

    result_df = df.copy()

    df = df.drop(columns=['UserName', 'Email'], errors='ignore')

    df1 = pd.get_dummies(data=df, columns=[
                         'InternetService', 'Contract', 'PaymentMethod'], dtype='int64')

    # Scale
    X = df1.copy()
    X["tenure"] = (X["tenure"] - TENURE_MIN) / (TENURE_MAX - TENURE_MIN)
    X["MonthlyCharges"] = (X["MonthlyCharges"] -
                           MONTHLY_MIN) / (MONTHLY_MAX - MONTHLY_MIN)
    X["TotalCharges"] = (X["TotalCharges"] - TOTAL_MIN) / \
        (TOTAL_MAX - TOTAL_MIN)

    # Predict
    probs = model.predict(X[[
        "gender", "SeniorCitizen", "Partner", "Dependents", "tenure", "PhoneService",
        "MultipleLines", "OnlineSecurity", "OnlineBackup", "DeviceProtection",
        "TechSupport", "StreamingTV", "StreamingMovies", "PaperlessBilling",
        "MonthlyCharges", "TotalCharges",
        "InternetService_DSL", "InternetService_Fiber optic", "InternetService_No",
        "Contract_Month-to-month", "Contract_One year", "Contract_Two year",
        "PaymentMethod_Bank transfer (automatic)", "PaymentMethod_Credit card (automatic)",
        "PaymentMethod_Electronic check", "PaymentMethod_Mailed check"
    ]])

    probs = probs.flatten() if isinstance(probs, np.ndarray) else probs
    churn_flags = [bool(p > 0.5) for p in probs]

    result_df["id"] = range(1, len(df) + 1)
    result_df["churn"] = churn_flags
    result_df["churnProbability"] = probs

    def to_camel(col: str) -> str:
        # Ví dụ: 'UserName' -> 'userName', 'PhoneService' -> 'phoneService'
        return col[0].lower() + col[1:] if col else col

    result_df.columns = [to_camel(c) for c in result_df.columns]

    return result_df.to_dict(orient="records")


class CustomerInput(BaseModel):
    userName: str
    email: str
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
        "churnProbability": round(float(pred_prob), 4)
    }

    return result
