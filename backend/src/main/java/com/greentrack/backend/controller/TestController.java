package com.greentrack.backend.controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    @GetMapping("/api/test-auth")
    public String test() {
        return "OK!";
    }
}
