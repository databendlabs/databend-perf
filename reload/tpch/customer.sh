echo "
DROP TABLE IF EXISTS customer;
" | bendctl query --warehouse=$WAREHOUSE

echo "CREATE TABLE IF NOT EXISTS customer (
    c_custkey     BIGINT not null,
    c_name        STRING not null,
    c_address     STRING not null,
    c_nationkey   INTEGER not null,
    c_phone       STRING not null,
    c_acctbal     DOUBLE   not null,
    c_mktsegment  STRING not null,
    c_comment     STRING not null
)" | bendctl query --warehouse=$WAREHOUSE

echo "
COPY INTO customer FROM 's3://repo.databend.rs/tpch100/customer/'
credentials=(aws_key_id='$AWS_KEY_ID' aws_secret_key='$AWS_SECRET_KEY') pattern ='customer.tbl.*'
file_format=(type='CSV' field_delimiter='|' record_delimiter='\\n' skip_header=1);
" | bendctl query --verbose --warehouse=$WAREHOUSE

echo "
SELECT count(*) FROM customer;
" | bendctl query --warehouse=$WAREHOUSE
