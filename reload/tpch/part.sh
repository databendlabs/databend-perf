#!/bin/bash

set -e

cat <<SQL | bendsql
select version();
SQL

cat <<SQL | bendsql
DROP TABLE IF EXISTS part;
SQL

cat <<SQL | bendsql
CREATE TABLE IF NOT EXISTS part (
    p_partkey     BIGINT not null,
    p_name        STRING not null,
    p_mfgr        STRING not null,
    p_brand       STRING not null,
    p_type        STRING not null,
    p_size        INTEGER not null,
    p_container   STRING not null,
    p_retailprice DOUBLE not null,
    p_comment     STRING not null
);
SQL

cat <<SQL | bendsql
COPY INTO part FROM 's3://repo.databend.rs/tpch100/part/'
credentials=(aws_key_id='$AWS_KEY_ID' aws_secret_key='$AWS_SECRET_KEY') pattern ='part.tbl.*'
file_format=(type='CSV' field_delimiter='|' record_delimiter='\\n' skip_header=1);
SQL

cat <<SQL | bendsql
SELECT count(*) FROM part;
SQL
