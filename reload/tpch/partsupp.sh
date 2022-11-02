echo "
DROP TABLE IF EXISTS partsupp;
" | bendsql query --warehouse=$WAREHOUSE

echo "CREATE TABLE IF NOT EXISTS partsupp (
    ps_partkey     BIGINT not null,
    ps_suppkey     BIGINT not null,
    ps_availqty    BIGINT not null,
    ps_supplycost  DOUBLE  not null,
    ps_comment     STRING not null
)" | bendsql query --warehouse=$WAREHOUSE

echo "
COPY INTO partsupp FROM 's3://repo.databend.rs/tpch100/partsupp/'
credentials=(aws_key_id='$AWS_KEY_ID' aws_secret_key='$AWS_SECRET_KEY') pattern ='partsupp.tbl.*'
file_format=(type='CSV' field_delimiter='|' record_delimiter='\\n' skip_header=1);
" | bendsql query --verbose --warehouse=$WAREHOUSE

echo "
SELECT count(*) FROM partsupp;
" | bendsql query --warehouse=$WAREHOUSE
