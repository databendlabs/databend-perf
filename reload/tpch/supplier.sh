echo "
DROP TABLE IF EXISTS supplier;
" | bendctl query --warehouse=$WAREHOUSE

echo "CREATE TABLE IF NOT EXISTS supplier (
    s_suppkey     BIGINT not null,
    s_name        STRING not null,
    s_address     STRING not null,
    s_nationkey   INTEGER not null,
    s_phone       STRING not null,
    s_acctbal     DOUBLE not null,
    s_comment     STRING not null
)" | bendctl query --warehouse=$WAREHOUSE

echo "
COPY INTO lineitem FROM 's3://repo.databend.rs/tpch100/supplier/'
credentials=(aws_key_id='$AWS_KEY_ID' aws_secret_key='$AWS_SECRET_KEY') pattern ='supplier.tbl.*'
file_format=(type='CSV' field_delimiter='|' record_delimiter='\\n' skip_header=1);
" | bendctl query --warehouse=$WAREHOUSE

echo "
SELECT count(*) FROM supplier;
" | bendctl query --warehouse=$WAREHOUSE
