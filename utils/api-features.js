class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  search() {
    const keyword = this.queryStr
      ? {
          name: {
            $regex: this.queryStr,
            $options: "i", //For case Insensitive
          },
        }
      : {};
      
      console.log(this.queryStr);
      console.log(keyword)
      this.query = this.query.find({...keyword});
      return this;
  }
}

module.exports =APIFeatures;