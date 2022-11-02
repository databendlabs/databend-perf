echo "
DROP TABLE IF EXISTS region;
" | bendsql query --warehouse=$WAREHOUSE

echo "CREATE TABLE IF NOT EXISTS region (
    r_regionkey  INTEGER not null,
    r_name       STRING not null,
    r_comment    STRING
)" | bendsql query --warehouse=$WAREHOUSE

echo "
COPY INTO region FROM 's3://repo.databend.rs/tpch100/region.tbl'
credentials=(aws_key_id='$AWS_KEY_ID' aws_secret_key='$AWS_SECRET_KEY')
file_format=(type='CSV' field_delimiter='|' record_delimiter='\\n' skip_header=1);
" | bendsql query --warehouse=$WAREHOUSE

echo "
SELECT count(*) FROM region;
" | bendsql query --warehouse=$WAREHOUSE
