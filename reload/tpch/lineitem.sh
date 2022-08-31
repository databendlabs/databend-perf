echo "
DROP TABLE lineitem;
)" | bendctl query --warehouse=$WAREHOUSE


echo "
CREATE TABLE IF NOT EXISTS lineitem (
    l_orderkey    BIGINT not null,
    l_partkey     BIGINT not null,
    l_suppkey     BIGINT not null,
    l_linenumber  BIGINT not null,
    l_quantity    DOUBLE not null,
    l_extendedprice  DOUBLE not null,
    l_discount    DOUBLE not null,
    l_tax         DOUBLE not null,
    l_returnflag  STRING not null,
    l_linestatus  STRING not null,
    l_shipdate    DATE not null,
    l_commitdate  DATE not null,
    l_receiptdate DATE not null,
    l_shipinstruct STRING not null,
    l_shipmode     STRING not null,
    l_comment      STRING not null
)" | bendctl query --warehouse=$WAREHOUSE

echo "
COPY INTO lineitem FROM 's3://repo.databend.rs/tpch100/lineitem'
credentials=(aws_key_id='$AWS_KEY_ID' aws_secret_key='$AWS_SECRET_KEY') pattern ='lineitem.tbl.*'
file_format=(type='CSV' field_delimiter='|' record_delimiter='\\n' skip_header=1);
" | bendctl query --warehouse=$WAREHOUSE
