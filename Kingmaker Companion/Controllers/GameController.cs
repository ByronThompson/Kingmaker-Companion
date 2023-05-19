using System.Diagnostics;
using Kingmaker_Companion.Models;
using Microsoft.AspNetCore.Mvc;

namespace Kingmaker_Companion.Controllers; 

public class GameController : Controller {
    // GET
    public IActionResult Join(string id = "none") {
        ViewBag.gameID = id;
        return View();
    }
}