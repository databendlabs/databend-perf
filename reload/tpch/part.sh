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
