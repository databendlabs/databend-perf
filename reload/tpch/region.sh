#!/bin/bash

set -e

cat <<SQL | bendsql
select version();
SQL

cat <<SQL | bendsql
DROP TABLE IF EXISTS region;
SQL

cat <<SQL | bendsql
CREATE TABLE IF NOT EXISTS region (
    r_regionkey  INTEGER not null,
    r_name       STRING not null,
    r_comment    STRING
);
SQL

cat <<SQL | bendsql
COPY INTO region FROM 's3://repo.databend.rs/tpch100/region.tbl'
credentials=(aws_key_id='$AWS_KEY_ID' aws_secret_key='$AWS_SECRET_KEY')
file_format=(type='CSV' field_delimiter='|' record_delimiter='\\n' skip_header=1);
SQL

cat <<SQL | bendsql
SELECT count(*) FROM region;
SQL
