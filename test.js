import dns from "node:dns";

dns.resolveSrv("_mongodb._tcp.cluster0.wegeets.mongodb.net", (err, records) => {
  console.log("resolveSrv:");
  console.log(err);
  console.log(records);
});

dns.resolve4("cluster0.wegeets.mongodb.net", (err, records) => {
  console.log("resolve4:");
  console.log(err);
  console.log(records);
});