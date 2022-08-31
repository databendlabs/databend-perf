echo "
DROP TABLE orders;
)" | bendctl query --warehouse=$WAREHOUSE

echo "
CREATE TABLE IF NOT EXISTS orders (
    o_orderkey       BIGINT not null,
    o_custkey        BIGINT not null,
    o_orderstatus    STRING not null,
    o_totalprice     DOUBLE not null,
    o_orderdate      DATE not null,
    o_orderpriority  STRING not null,
    o_clerk          STRING not null,
    o_shippriority   INTEGER not null,
    o_comment        STRING not null
)" | bendctl query --warehouse=$WAREHOUSE
