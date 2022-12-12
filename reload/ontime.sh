#!/bin/bash

set -e

cat <<SQL | bendsql query
select version();
SQL

cat <<SQL | bendsql query
DROP TABLE IF EXISTS ontime_reload ALL;
SQL

cat <<SQL | bendsql query
CREATE TABLE IF NOT EXISTS ontime_reload (
    Year UInt16 NOT NULL,
    Quarter UInt8 NOT NULL,
    Month UInt8 NOT NULL,
    DayofMonth UInt8 NOT NULL,
    DayOfWeek UInt8 NOT NULL,
    FlightDate Date NOT NULL,
    Reporting_Airline String NOT NULL,
    DOT_ID_Reporting_Airline Int32 NOT NULL,
    IATA_CODE_Reporting_Airline String NOT NULL,
    Tail_Number String NOT NULL,
    Flight_Number_Reporting_Airline String NOT NULL,
    OriginAirportID Int32 NOT NULL,
    OriginAirportSeqID Int32 NOT NULL,
    OriginCityMarketID Int32 NOT NULL,
    Origin String NOT NULL,
    OriginCityName String NOT NULL,
    OriginState String NOT NULL,
    OriginStateFips String NOT NULL,
    OriginStateName String NOT NULL,
    OriginWac Int32 NOT NULL,
    DestAirportID Int32 NOT NULL,
    DestAirportSeqID Int32 NOT NULL,
    DestCityMarketID Int32 NOT NULL,
    Dest String NOT NULL,
    DestCityName String NOT NULL,
    DestState String NOT NULL,
    DestStateFips String NOT NULL,
    DestStateName String NOT NULL,
    DestWac Int32 NOT NULL,
    CRSDepTime Int32 NOT NULL,
    DepTime Int32 NOT NULL,
    DepDelay Int32 NOT NULL,
    DepDelayMinutes Int32 NOT NULL,
    DepDel15 Int32 NOT NULL,
    DepartureDelayGroups String NOT NULL,
    DepTimeBlk String NOT NULL,
    TaxiOut Int32 NOT NULL,
    WheelsOff Int32 NOT NULL,
    WheelsOn Int32 NOT NULL,
    TaxiIn Int32 NOT NULL,
    CRSArrTime Int32 NOT NULL,
    ArrTime Int32 NOT NULL,
    ArrDelay Int32 NOT NULL,
    ArrDelayMinutes Int32 NOT NULL,
    ArrDel15 Int32 NOT NULL,
    ArrivalDelayGroups Int32 NOT NULL,
    ArrTimeBlk String NOT NULL,
    Cancelled UInt8 NOT NULL,
    CancellationCode String NOT NULL,
    Diverted UInt8 NOT NULL,
    CRSElapsedTime Int32 NOT NULL,
    ActualElapsedTime Int32 NOT NULL,
    AirTime Int32 NOT NULL,
    Flights Int32 NOT NULL,
    Distance Int32 NOT NULL,
    DistanceGroup UInt8 NOT NULL,
    CarrierDelay Int32 NOT NULL,
    WeatherDelay Int32 NOT NULL,
    NASDelay Int32 NOT NULL,
    SecurityDelay Int32 NOT NULL,
    LateAircraftDelay Int32 NOT NULL,
    FirstDepTime String NOT NULL,
    TotalAddGTime String NOT NULL,
    LongestAddGTime String NOT NULL,
    DivAirportLandings String NOT NULL,
    DivReachedDest String NOT NULL,
    DivActualElapsedTime String NOT NULL,
    DivArrDelay String NOT NULL,
    DivDistance String NOT NULL,
    Div1Airport String NOT NULL,
    Div1AirportID Int32 NOT NULL,
    Div1AirportSeqID Int32 NOT NULL,
    Div1WheelsOn String NOT NULL,
    Div1TotalGTime String NOT NULL,
    Div1LongestGTime String NOT NULL,
    Div1WheelsOff String NOT NULL,
    Div1TailNum String NOT NULL,
    Div2Airport String NOT NULL,
    Div2AirportID Int32 NOT NULL,
    Div2AirportSeqID Int32 NOT NULL,
    Div2WheelsOn String NOT NULL,
    Div2TotalGTime String NOT NULL,
    Div2LongestGTime String NOT NULL,
    Div2WheelsOff String NOT NULL,
    Div2TailNum String NOT NULL,
    Div3Airport String NOT NULL,
    Div3AirportID Int32 NOT NULL,
    Div3AirportSeqID Int32 NOT NULL,
    Div3WheelsOn String NOT NULL,
    Div3TotalGTime String NOT NULL,
    Div3LongestGTime String NOT NULL,
    Div3WheelsOff String NOT NULL,
    Div3TailNum String NOT NULL,
    Div4Airport String NOT NULL,
    Div4AirportID Int32 NOT NULL,
    Div4AirportSeqID Int32 NOT NULL,
    Div4WheelsOn String NOT NULL,
    Div4TotalGTime String NOT NULL,
    Div4LongestGTime String NOT NULL,
    Div4WheelsOff String NOT NULL,
    Div4TailNum String NOT NULL,
    Div5Airport String NOT NULL,
    Div5AirportID Int32 NOT NULL,
    Div5AirportSeqID Int32 NOT NULL,
    Div5WheelsOn String NOT NULL,
    Div5TotalGTime String NOT NULL,
    Div5LongestGTime String NOT NULL,
    Div5WheelsOff String NOT NULL,
    Div5TailNum String NOT NULL
) ENGINE = FUSE;
SQL

cat <<SQL | bendsql query
COPY INTO ontime_reload FROM 's3://repo.databend.rs/m_ontime/'
credentials=(aws_key_id='$AWS_KEY_ID' aws_secret_key='$AWS_SECRET_KEY') pattern ='.*[.]csv'
file_format=(type='CSV' field_delimiter='\\t' record_delimiter='\\n' skip_header=1);
SQL

cat <<SQL | bendsql query
SELECT count(*) FROM ontime_reload;
SQL

cat <<SQL | bendsql query
DROP TABLE IF EXISTS ontime ALL;
SQL

cat <<SQL | bendsql query
ALTER TABLE ontime_reload RENAME TO ontime;
SQL
