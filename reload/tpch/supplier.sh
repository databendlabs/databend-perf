echo "CREATE TABLE IF NOT EXISTS supplier (
    s_suppkey     BIGINT not null,
    s_name        STRING not null,
    s_address     STRING not null,
    s_nationkey   INTEGER not null,
    s_phone       STRING not null,
    s_acctbal     DOUBLE not null,
    s_comment     STRING not null
)" | bendctl query --warehouse=$WAREHOUSE
