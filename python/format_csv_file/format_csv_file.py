import pandas as pd
import numpy as np
import random
import string

PATH = '/Users/theanhnguyen/Code/SPCK CSI15/python/format_csv_file/telco_customer_churn.csv'

df = pd.read_csv(PATH)

# Lấy 20 dòng ngẫu nhiên
sample_df = df.sample(n=20, random_state=42).reset_index(drop=True)

# Hàm tạo tên ngẫu nhiên


def random_username(length=8):
    return ''.join(random.choices(string.ascii_lowercase, k=length))


# Sinh danh sách username và email tương ứng
usernames = [random_username(random.randint(6, 8))
             for _ in range(len(sample_df))]
emails = [f"{u}@example.com" for u in usernames]

# Thêm cột mới
sample_df['UserName'] = usernames
sample_df['Email'] = emails

# Xoá cột customerID và Churn (nếu tồn tại)
sample_df = sample_df.drop(columns=['customerID'], errors='ignore')

# Lưu ra file CSV mới
sample_df.to_csv('/Users/theanhnguyen/Code/SPCK CSI15/python/format_csv_file/telco_sample_20.csv',
                 index=False)

print("Đã lưu 20 dòng ngẫu nhiên (đã xóa customerID & Churn) vào telco_sample_20.csv")
