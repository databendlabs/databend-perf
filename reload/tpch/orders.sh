echo "
DROP TABLE IF EXISTS orders;
" | bendctl query --warehouse=$WAREHOUSE

echo "
CREATE TABLE IF NOT EXISTS orders (
    o_orderkey       BIGINT not null,
    o_custkey        BIGINT not null,
    o_orderstatus    STRING not null,
    o_totalprice     DOUBLE not null,
    o_orderdate      DATE not null,
    o_orderpriority  STRING not null,
    o_clerk          STRING not null,
    o_shippriority   INTEGER not null,
    o_comment        STRING not null
)" | bendctl query --warehouse=$WAREHOUSE

echo "
COPY INTO orders FROM 's3://repo.databend.rs/tpch100/orders.tbl'
credentials=(aws_key_id='$AWS_KEY_ID' aws_secret_key='$AWS_SECRET_KEY')
file_format=(type='CSV' field_delimiter='|' record_delimiter='\\n' skip_header=1);
" | bendctl query --warehouse=$WAREHOUSE

echo "
SELECT count(*) FROM orders;
" | bendctl query --warehouse=$WAREHOUSE
