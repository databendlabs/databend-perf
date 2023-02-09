#!/bin/bash

set -e

cat <<SQL | bendsql query
select version();
SQL

cat <<SQL | bendsql query
DROP TABLE IF EXISTS supplier;
SQL

cat <<SQL | bendsql query
CREATE TABLE IF NOT EXISTS supplier (
    s_suppkey     BIGINT not null,
    s_name        STRING not null,
    s_address     STRING not null,
    s_nationkey   INTEGER not null,
    s_phone       STRING not null,
    s_acctbal     DOUBLE not null,
    s_comment     STRING not null
);
SQL

cat <<SQL | bendsql query
COPY INTO supplier FROM 's3://repo.databend.rs/tpch100/supplier/'
credentials=(aws_key_id='$AWS_KEY_ID' aws_secret_key='$AWS_SECRET_KEY') pattern ='supplier.tbl.*'
file_format=(type='CSV' field_delimiter='|' record_delimiter='\\n' skip_header=1);
SQL

cat <<SQL | bendsql query
SELECT count(*) FROM supplier;
SQL
