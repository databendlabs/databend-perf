echo "CREATE TABLE IF NOT EXISTS partsupp (
    ps_partkey     BIGINT not null,
    ps_suppkey     BIGINT not null,
    ps_availqty    BIGINT not null,
    ps_supplycost  DOUBLE  not null,
    ps_comment     STRING not null
)" | bendctl query --warehouse=$WAREHOUSE
