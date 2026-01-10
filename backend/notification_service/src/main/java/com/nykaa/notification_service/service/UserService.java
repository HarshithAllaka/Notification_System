package com.nykaa.notification_service.service;

import com.nykaa.notification_service.entity.Preference;
import com.nykaa.notification_service.entity.User;
import com.nykaa.notification_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public void saveUsers(List<User> users) {
        for (User user : users) {
            if (user.getPreference() == null) {
                Preference pref = new Preference();
                pref.setUser(user);
                user.setPreference(pref);
            }
            userRepository.save(user);
        }
    }
}