echo "
DROP TABLE IF EXISTS part;
" | bendctl query --warehouse=$WAREHOUSE

echo "CREATE TABLE IF NOT EXISTS part (
    p_partkey     BIGINT not null,
    p_name        STRING not null,
    p_mfgr        STRING not null,
    p_brand       STRING not null,
    p_type        STRING not null,
    p_size        INTEGER not null,
    p_container   STRING not null,
    p_retailprice DOUBLE not null,
    p_comment     STRING not null
)" | bendctl query --warehouse=$WAREHOUSE

echo "
COPY INTO part FROM 's3://repo.databend.rs/tpch100/part/'
credentials=(aws_key_id='$AWS_KEY_ID' aws_secret_key='$AWS_SECRET_KEY') pattern ='part.tbl.*'
file_format=(type='CSV' field_delimiter='|' record_delimiter='\\n' skip_header=1);
" | bendctl query --verbose --warehouse=$WAREHOUSE

echo "
SELECT count(*) FROM part;
" | bendctl query --warehouse=$WAREHOUSE
