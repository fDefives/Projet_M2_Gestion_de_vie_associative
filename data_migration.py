path_data="docs_clients/data_client/perso-ANNUAIRE ASSO- BDE.xlsx"
import pandas as pd
df_asso=pd.read_excel(path_data, sheet_name='Association',skiprows=2)
df_bde=pd.read_excel(path_data, sheet_name='BDE',skiprows=2)
print(df_asso)
print(df_bde)
print()