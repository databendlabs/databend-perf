echo "CREATE TABLE IF NOT EXISTS region (
    r_regionkey  INTEGER not null,
    r_name       STRING not null,
    r_comment    STRING
)" | bendctl query --warehouse=$WAREHOUSE

