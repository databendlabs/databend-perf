#!/bin/bash

set -e

cat <<SQL | bendsql query
select version();
SQL

cat <<SQL | bendsql query
DROP TABLE IF EXISTS partsupp;
SQL

cat <<SQL | bendsql query
CREATE TABLE IF NOT EXISTS partsupp (
    ps_partkey     BIGINT not null,
    ps_suppkey     BIGINT not null,
    ps_availqty    BIGINT not null,
    ps_supplycost  DOUBLE  not null,
    ps_comment     STRING not null
);
SQL

cat <<SQL | bendsql query
COPY INTO partsupp FROM 's3://repo.databend.rs/tpch100/partsupp/'
credentials=(aws_key_id='$AWS_KEY_ID' aws_secret_key='$AWS_SECRET_KEY') pattern ='partsupp.tbl.*'
file_format=(type='CSV' field_delimiter='|' record_delimiter='\\n' skip_header=1);
SQL

cat <<SQL | bendsql query
SELECT count(*) FROM partsupp;
SQL
