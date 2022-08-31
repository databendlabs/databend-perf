echo "
DROP TABLE IF EXISTS nation;
" | bendctl query --warehouse=$WAREHOUSE

echo "
CREATE TABLE IF NOT EXISTS nation (
    n_nationkey  INTEGER not null,
    n_name       STRING not null,
    n_regionkey  INTEGER not null,
    n_comment    STRING
)" | bendctl query --warehouse=$WAREHOUSE

echo "
COPY INTO nation FROM 's3://repo.databend.rs/tpch100/nation.tbl'
credentials=(aws_key_id='$AWS_KEY_ID' aws_secret_key='$AWS_SECRET_KEY')
file_format=(type='CSV' field_delimiter='|' record_delimiter='\\n' skip_header=1);
" | bendctl query --warehouse=$WAREHOUSE
