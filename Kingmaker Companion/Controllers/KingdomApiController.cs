using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;

namespace Kingmaker_Companion.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KingdomApiController : ControllerBase {
        private static readonly ConnectionMultiplexer redis = Globals.REDIS;
        
        // GET: api/Api
        [HttpGet]
        public string Get()
        {
            return redis.GetDatabase().StringGet("7f8cde9c-fd52-4a8a-f6a7-c1c2b85dfb9d");
        }

        // GET: api/Api/5
        [HttpGet("{id}", Name = "Get")]
        public string Get(string id) {
            string? r = redis.GetDatabase().StringGet(id);
            return r ?? "{\"message\": \"error\"}";
        }

        // POST: api/Api
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT: api/Api/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE: api/Api/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
