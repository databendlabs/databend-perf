#!/bin/bash

set -e

cat <<SQL | bendsql
select version();
SQL

cat <<SQL | bendsql
DROP TABLE IF EXISTS hits ALL;
SQL

cat <<SQL | bendsql
CREATE TABLE IF NOT EXISTS hits (
  WatchID UINT64,
  JavaEnable UINT8,
  Title VARCHAR,
  GoodEvent INT8,
  EventTime DateTime,
  EventDate Date,
  CounterID UINT32,
  ClientIP UINT32,
  RegionID UINT32,
  UserID UINT64,
  CounterClass INT8,
  OS UINT8,
  UserAgent UINT8,
  URL VARCHAR,
  Referrer VARCHAR,
  Refresh UINT8,
  ReferrerCategoryID UINT16,
  ReferrerRegionID UINT32,
  URLCategoryID UINT16,
  URLRegionID UINT32,
  ResolutionWidth UINT16,
  ResolutionHeight UINT16,
  ResolutionDepth UINT8,
  FlashMajor UINT8,
  FlashMinor UINT8,
  FlashMinor2 VARCHAR,
  NetMajor UINT8,
  NetMinor UINT8,
  UserAgentMajor UINT16,
  UserAgentMinor VARCHAR,
  CookieEnable UINT8,
  JavascriptEnable UINT8,
  IsMobile UINT8,
  MobilePhone UINT8,
  MobilePhoneModel VARCHAR,
  Params VARCHAR,
  IPNetworkID UINT32,
  TrafficSourceID INT8,
  SearchEngineID UINT16,
  SearchPhrase VARCHAR,
  AdvEngineID UINT8,
  IsArtificial UINT8,
  WindowClientWidth UINT16,
  WindowClientHeight UINT16,
  ClientTimeZone INT16,
  ClientEventTime VARCHAR,
  SilverlightVersion1 UINT8,
  SilverlightVersion2 UINT8,
  SilverlightVersion3 UINT32,
  SilverlightVersion4 UINT16,
  PageCharset VARCHAR,
  CodeVersion UINT32,
  IsLink UINT8,
  IsDownload UINT8,
  IsNotBounce UINT8,
  FUniqID UINT64,
  OriginalURL VARCHAR,
  HID UINT32,
  IsOldCounter UINT8,
  IsEvent UINT8,
  IsParameter UINT8,
  DontCountHits UINT8,
  WithHash UINT8,
  HitColor VARCHAR,
  LocalEventTime DateTime,
  Age UINT8,
  Sex UINT8,
  Income UINT8,
  Interests UINT16,
  Robotness UINT8,
  RemoteIP UINT32,
  WindowName INT32,
  OpenerName INT32,
  HistoryLength INT16,
  BrowserLanguage VARCHAR,
  BrowserCountry VARCHAR,
  SocialNetwork VARCHAR,
  SocialAction VARCHAR,
  HTTPError UINT16,
  SendTiming UINT32,
  DNSTiming UINT32,
  ConnectTiming UINT32,
  ResponseStartTiming UINT32,
  ResponseEndTiming UINT32,
  FetchTiming UINT32,
  SocialSourceNetworkID UINT8,
  SocialSourcePage VARCHAR,
  ParamPrice INT64,
  ParamOrderID VARCHAR,
  ParamCurrency VARCHAR,
  ParamCurrencyID UINT16,
  OpenstatServiceName VARCHAR,
  OpenstatCampaignID VARCHAR,
  OpenstatAdID VARCHAR,
  OpenstatSourceID VARCHAR,
  UTMSource VARCHAR,
  UTMMedium VARCHAR,
  UTMCampaign VARCHAR,
  UTMContent VARCHAR,
  UTMTerm VARCHAR,
  FromTag VARCHAR,
  HasGCLID UINT8,
  ReferrerHash UINT64,
  URLHash UINT64,
  CLID UINT32
) ENGINE=FUSE;
SQL

cat <<SQL | bendsql
COPY INTO hits FROM 'https://datasets.databend.com/hits_100m_obfuscated_v1.tsv.xz' FILE_FORMAT = (type = TSV compression = XZ field_delimiter = '\t'  record_delimiter = '\n' skip_header = 0);
SQL

cat <<SQL | bendsql
SELECT count(*) FROM hits;
SQL
