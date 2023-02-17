class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  Search() {
    let keyword = this.queryString.keyword
      ? {
          name: {
            $regex: this.queryString.keyword,
            $options: "i",
          },
        }
      : {};
    this.query = this.query.find({ ...keyword })
    return this;
  }
  filter(){
    const queryStringCopy = {...this.queryString}
    
    // Removing fields from the query
    const removeField = ['keyword', 'limit', 'page']
    removeField.forEach(element => delete queryStringCopy[element])

    // Advance filter for price, rating, etc.
    let queryString = JSON.stringify(queryStringCopy)
    queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, match =>`$${match}`)

    this.query = this.query.find(JSON.parse(queryString))
    return this
  }
  pagitnation(resultsPerPage){
    const currentPage = Number(this.queryString.page) || 1
    const skip = resultsPerPage * (currentPage - 1)

    this.query.limit(resultsPerPage).skip(skip)
    return this
  } 
}

module.exports = APIFeatures;
