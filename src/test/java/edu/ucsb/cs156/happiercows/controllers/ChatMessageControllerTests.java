package edu.ucsb.cs156.happiercows.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import static org.mockito.ArgumentMatchers.any;

import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.testconfig.TestConfig;
import java.util.Arrays;
import java.util.Optional;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.repositories.ChatMessageRepository;
import edu.ucsb.cs156.happiercows.entities.ChatMessage;

import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.entities.Game;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@WebMvcTest(controllers = ChatMessageController.class)
public class ChatMessageControllerTests extends ControllerTestCase {
    
    @MockBean
    ChatMessageRepository chatMessageRepository;

    @MockBean
    FarmerRepository farmerRepository;

    @MockBean
    UserRepository userRepository;

    @Autowired
    ObjectMapper mapper;


    //* */ get tests
    @WithMockUser(roles = {"USER"})
    @Test
    public void userInGameCanGetChatMessages() throws Exception {
        
        // arrange
        Long gameId = 1L;
        Long userId = 1L;
        int page = 0;
        int size = 10;

        ChatMessage chatMessage1 = ChatMessage.builder().id(1L).gameId(gameId).userId(userId).build();
        ChatMessage chatMessage2 = ChatMessage.builder().id(2L).gameId(gameId).userId(userId).build();

        Page<ChatMessage> pageOfChatMessages = new PageImpl<ChatMessage>(Arrays.asList(chatMessage1, chatMessage2));

        when(chatMessageRepository.findByGameId(gameId, PageRequest.of(page, size, Sort.by("timestamp").descending()))).thenReturn(pageOfChatMessages);
        
        Farmer farmer = Farmer.builder()
                .game(Game.builder().showChat(true).build())
                .build();
        when(farmerRepository.findByGameIdAndUserId(gameId, userId)).thenReturn(Optional.of(farmer));


        // act
        MvcResult response = mockMvc.perform(get("/api/chat/get?gameId={gameId}&page={page}&size={size}", gameId, page, size))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(chatMessageRepository, atLeastOnce()).findByGameId(gameId, PageRequest.of(page, size, Sort.by("timestamp").descending()));
        String responseString = response.getResponse().getContentAsString();
        String expectedResponseString = mapper.writeValueAsString(pageOfChatMessages);
        log.info("Got back from API: {}",responseString);
        assertEquals(expectedResponseString, responseString);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCanGetChatMessages() throws Exception {
        
        // arrange
        Long gameId = 1L;
        Long userId = 1L;
        int page = 0;
        int size = 10;

        ChatMessage chatMessage1 = ChatMessage.builder().id(1L).gameId(gameId).userId(userId).build();
        ChatMessage chatMessage2 = ChatMessage.builder().id(2L).gameId(gameId).userId(userId).build();

        Page<ChatMessage> pageOfChatMessages = new PageImpl<ChatMessage>(Arrays.asList(chatMessage1, chatMessage2));

        when(chatMessageRepository.findByGameId(gameId, PageRequest.of(page, size, Sort.by("timestamp").descending()))).thenReturn(pageOfChatMessages);
        
        // act
        MvcResult response = mockMvc.perform(get("/api/chat/get?gameId={gameId}&page={page}&size={size}", gameId, page, size))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(chatMessageRepository, atLeastOnce()).findByGameId(gameId, PageRequest.of(page, size, Sort.by("timestamp").descending()));
        String responseString = response.getResponse().getContentAsString();
        String expectedResponseString = mapper.writeValueAsString(pageOfChatMessages);
        log.info("Got back from API: {}",responseString);
        assertEquals(expectedResponseString, responseString);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void userNotInGameCannotGetChatMessages() throws Exception {
        
        // arrange
        Long gameId = 1L;
        Long userId = 1L;
        int page = 0;
        int size = 10;

        ChatMessage chatMessage1 = ChatMessage.builder().id(1L).gameId(gameId).userId(userId).build();
        ChatMessage chatMessage2 = ChatMessage.builder().id(2L).gameId(gameId).userId(userId).build();

        Page<ChatMessage> pageOfChatMessages = new PageImpl<ChatMessage>(Arrays.asList(chatMessage1, chatMessage2));

        when(chatMessageRepository.findByGameId(gameId, PageRequest.of(page, size, Sort.by("timestamp").descending()))).thenReturn(pageOfChatMessages);
        
        when(farmerRepository.findByGameIdAndUserId(gameId, userId)).thenReturn(Optional.empty());

        // act
        mockMvc.perform(get("/api/chat/get?gameId={gameId}&page={page}&size={size}", gameId, page, size))
            .andExpect(status().isForbidden()).andReturn();
        
        // assert
        verify(chatMessageRepository, times(0)).findByGameId(gameId, PageRequest.of(page, size, Sort.by("timestamp").descending()));

    }
    
    //* */ admin/get tests
    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCanGetAllChatMessages() throws Exception {
        
        // arrange
        Long gameId = 1L;
        int page = 0;
        int size = 10;

        ChatMessage chatMessage1 = ChatMessage.builder().id(1L).gameId(gameId).build();
        ChatMessage chatMessage2 = ChatMessage.builder().id(2L).gameId(gameId).build();

        Page<ChatMessage> pageOfChatMessages = new PageImpl<ChatMessage>(Arrays.asList(chatMessage1, chatMessage2));

        when(chatMessageRepository.findAllByGameId(gameId, PageRequest.of(page, size, Sort.by("timestamp").descending()))).thenReturn(pageOfChatMessages);

        // act
        MvcResult response = mockMvc.perform(get("/api/chat/admin/get?gameId={gameId}&page={page}&size={size}", gameId, page, size))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(chatMessageRepository, atLeastOnce()).findAllByGameId(gameId, PageRequest.of(page, size, Sort.by("timestamp").descending()));
        String responseString = response.getResponse().getContentAsString();
        String expectedResponseString = mapper.writeValueAsString(pageOfChatMessages);
        log.info("Got back from API: {}",responseString);
        assertEquals(expectedResponseString, responseString);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void userCannotUseAdminGetAPIEndpoint() throws Exception {
        
        // arrange
        Long gameId = 1L;
        int page = 0;
        int size = 10;

        ChatMessage chatMessage1 = ChatMessage.builder().id(1L).gameId(gameId).build();
        ChatMessage chatMessage2 = ChatMessage.builder().id(2L).gameId(gameId).build();

        Page<ChatMessage> pageOfChatMessages = new PageImpl<ChatMessage>(Arrays.asList(chatMessage1, chatMessage2));

        when(chatMessageRepository.findAllByGameId(gameId, PageRequest.of(page, size, Sort.by("timestamp").descending()))).thenReturn(pageOfChatMessages);

        // act
        mockMvc.perform(get("/api/chat/admin/get?gameId={gameId}&page={page}&size={size}", gameId, page, size))
            .andExpect(status().isForbidden()).andReturn();

        // assert
        verify(chatMessageRepository, times(0)).findAllByGameId(gameId, PageRequest.of(page, size, Sort.by("timestamp").descending()));
    }

    //* */ admin/hidden tests
    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCanGetHiddenChatMessages() throws Exception {
        
        // arrange
        Long gameId = 1L;
        int page = 0;
        int size = 10;

        ChatMessage chatMessage1 = ChatMessage.builder().id(1L).gameId(gameId).hidden(true).build();
        ChatMessage chatMessage2 = ChatMessage.builder().id(2L).gameId(gameId).hidden(true).build();

        Page<ChatMessage> pageOfChatMessages = new PageImpl<ChatMessage>(Arrays.asList(chatMessage1, chatMessage2));

        when(chatMessageRepository.findByGameIdAndHidden(gameId, PageRequest.of(page, size, Sort.by("timestamp").descending()))).thenReturn(pageOfChatMessages);

        // act
        MvcResult response = mockMvc.perform(get("/api/chat/admin/hidden?gameId={gameId}&page={page}&size={size}", gameId, page, size))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(chatMessageRepository, atLeastOnce()).findByGameIdAndHidden(gameId, PageRequest.of(page, size, Sort.by("timestamp").descending()));
        String responseString = response.getResponse().getContentAsString();
        String expectedResponseString = mapper.writeValueAsString(pageOfChatMessages);
        log.info("Got back from API: {}",responseString);
        assertEquals(expectedResponseString, responseString);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void userCannotGetHiddenChatMessages() throws Exception {
        
        // arrange
        Long gameId = 1L;
        int page = 0;
        int size = 10;

        ChatMessage chatMessage1 = ChatMessage.builder().id(1L).gameId(gameId).hidden(true).build();
        ChatMessage chatMessage2 = ChatMessage.builder().id(2L).gameId(gameId).hidden(true).build();

        Page<ChatMessage> pageOfChatMessages = new PageImpl<ChatMessage>(Arrays.asList(chatMessage1, chatMessage2));

        when(chatMessageRepository.findByGameIdAndHidden(gameId, PageRequest.of(page, size, Sort.by("timestamp").descending()))).thenReturn(pageOfChatMessages);

        // act
        mockMvc.perform(get("/api/chat/admin/hidden?gameId={gameId}&page={page}&size={size}", gameId, page, size))
            .andExpect(status().isForbidden()).andReturn();

        // assert
        verify(chatMessageRepository, times(0)).findByGameIdAndHidden(gameId, PageRequest.of(page, size, Sort.by("timestamp").descending()));
    }

    //* */ post tests
    @WithMockUser(roles = {"USER"})
    @Test
    public void userInGameCanPostChatMessages() throws Exception {
        
        // arrange
        Long gameId = 1L;
        Long userId = 1L;
        String content = "Hello world!";

        ChatMessage chatMessage = ChatMessage.builder().id(0L).gameId(gameId).userId(userId).message(content).build();

        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(chatMessage);
        
        Farmer farmer = Farmer.builder()
                .game(Game.builder().showChat(true).build())
                .build();
        when(farmerRepository.findByGameIdAndUserId(gameId, userId)).thenReturn(Optional.of(farmer));

        //act 
        MvcResult response = mockMvc.perform(post("/api/chat/post?gameId={gameId}&content={content}", gameId, content).with(csrf()))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(chatMessageRepository, atLeastOnce()).save(any(ChatMessage.class));
        String responseString = response.getResponse().getContentAsString();
        String expectedResponseString = mapper.writeValueAsString(chatMessage);
        log.info("Got back from API: {}",responseString);
        assertEquals(expectedResponseString, responseString);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void userNotInGameCannotPostChatMessages() throws Exception {
        
        // arrange
        Long gameId = 1L;
        Long userId = 1L;
        String content = "Hello world!";

        ChatMessage chatMessage = ChatMessage.builder().id(0L).gameId(gameId).userId(userId).message(content).build();

        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(chatMessage);
        
        when(farmerRepository.findByGameIdAndUserId(gameId, userId)).thenReturn(Optional.empty());

        //act 
        mockMvc.perform(post("/api/chat/post?gameId={gameId}&content={content}", gameId, content).with(csrf()))
            .andExpect(status().isForbidden()).andReturn();

        // assert
        verify(chatMessageRepository, times(0)).save(any(ChatMessage.class));
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCanPostChatMessages() throws Exception {
        
        // arrange
        Long gameId = 1L;
        Long userId = 1L;
        String content = "Hello world!";

        ChatMessage chatMessage = ChatMessage.builder().id(0L).gameId(gameId).userId(userId).message(content).build();

        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(chatMessage);
        
        //act 
        MvcResult response = mockMvc.perform(post("/api/chat/post?gameId={gameId}&content={content}", gameId, content).with(csrf()))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(chatMessageRepository, atLeastOnce()).save(any(ChatMessage.class));
        String responseString = response.getResponse().getContentAsString();
        String expectedResponseString = mapper.writeValueAsString(chatMessage);
        log.info("Got back from API: {}",responseString);
        assertEquals(expectedResponseString, responseString);
    }

    //* */ hide tests
    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCannotHideChatMessagesThatDontExist() throws Exception {
        
        // arrange
        Long messageId = 0L;

        when(chatMessageRepository.findById(messageId)).thenReturn(Optional.empty());

        //act 
        mockMvc.perform(put("/api/chat/hide?chatMessageId={messageId}", messageId).with(csrf()))
            .andExpect(status().isNotFound()).andReturn();

        // assert
        verify(chatMessageRepository, atLeastOnce()).findById(messageId);
        verify(chatMessageRepository, times(0)).save(any(ChatMessage.class));
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCanHideChatMessages() throws Exception {
        
        // arrange
        Long messageId = 0L;
        Long gameId = 1L;
        Long userId = 1L;

        ChatMessage chatMessage = ChatMessage.builder().id(messageId).userId(1L).gameId(1L).build();
        when(chatMessageRepository.findById(messageId)).thenReturn(Optional.of(chatMessage));

        Farmer farmer = Farmer.builder()
            .game(Game.builder().build())
            .build();
when(farmerRepository.findByGameIdAndUserId(gameId, userId)).thenReturn(Optional.of(farmer));

        //act 
        MvcResult response = mockMvc.perform(put("/api/chat/hide?chatMessageId={messageId}", messageId).with(csrf()))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(chatMessageRepository, atLeastOnce()).findById(messageId);
        verify(chatMessageRepository, atLeastOnce()).save(any(ChatMessage.class));
        String responseString = response.getResponse().getContentAsString();
        chatMessage.setHidden(true);
        String expectedResponseString = mapper.writeValueAsString(chatMessage);
        log.info("Got back from API: {}",responseString);
        assertEquals(expectedResponseString, responseString);
    }

    // Users can hide messages that are their own
    @WithMockUser(roles = {"USER"})
    @Test
    public void userCanDeleteTheirOwnChatMessages() throws Exception {
        
        // arrange
        Long messageId = 0L;
        Long gameId = 1L;
        Long userId = 1L;

        ChatMessage chatMessage = ChatMessage.builder().id(messageId).userId(1L).gameId(1L).build();
        when(chatMessageRepository.findById(messageId)).thenReturn(Optional.of(chatMessage));

        Farmer farmer = Farmer.builder()
                .game(Game.builder().showChat(true).build())
                .build();
        when(farmerRepository.findByGameIdAndUserId(gameId, userId)).thenReturn(Optional.of(farmer));

        //act 
        MvcResult response = mockMvc.perform(put("/api/chat/hide?chatMessageId={messageId}", messageId).with(csrf()))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(chatMessageRepository, atLeastOnce()).findById(messageId);
        verify(chatMessageRepository, atLeastOnce()).save(any(ChatMessage.class));
        String responseString = response.getResponse().getContentAsString();
        chatMessage.setHidden(true);
        String expectedResponseString = mapper.writeValueAsString(chatMessage);
        log.info("Got back from API: {}",responseString);
        assertEquals(expectedResponseString, responseString);
    }

    // Users cannot hide messages that aren't their own
    @WithMockUser(roles = {"USER"})
    @Test
    public void userCannotDeleteOtherUsersChatMessages() throws Exception {
        
        // arrange
        Long messageId = 0L;

        ChatMessage chatMessage = ChatMessage.builder().id(messageId).userId(2L).build();
        when(chatMessageRepository.findById(messageId)).thenReturn(Optional.of(chatMessage));

        //act 
        mockMvc.perform(put("/api/chat/hide?chatMessageId={messageId}", messageId).with(csrf()))
            .andExpect(status().isForbidden()).andReturn();

        // assert
        verify(chatMessageRepository, atLeastOnce()).findById(messageId);
        verify(chatMessageRepository, times(0)).save(any(ChatMessage.class));
    }

    // Users cannot hide messages that aren't their own
    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCanDeleteOtherUsersChatMessages() throws Exception {
        
        // arrange
        Long messageId = 0L;
        Long gameId = 1L;
        Long userId = 1L;

        ChatMessage chatMessage = ChatMessage.builder().id(messageId).userId(2L).gameId(1L).build();
        when(chatMessageRepository.findById(messageId)).thenReturn(Optional.of(chatMessage));

        Farmer farmer = Farmer.builder()
                .game(Game.builder().build())
                .build();
        when(farmerRepository.findByGameIdAndUserId(gameId, userId)).thenReturn(Optional.of(farmer));

        //act 
        MvcResult response = mockMvc.perform(put("/api/chat/hide?chatMessageId={messageId}", messageId).with(csrf()))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(chatMessageRepository, atLeastOnce()).findById(messageId);
        verify(chatMessageRepository, atLeastOnce()).save(any(ChatMessage.class));
        String responseString = response.getResponse().getContentAsString();
        chatMessage.setHidden(true);
        String expectedResponseString = mapper.writeValueAsString(chatMessage);
        log.info("Got back from API: {}",responseString);
        assertEquals(expectedResponseString, responseString);
    }

    
    @WithMockUser(roles = {"USER"})
    @Test
    public void userCannotInteractWithChatIfShowChatIsFalse() throws Exception {
        
        // arrange
        Long messageId = 0L;
        Long gameId = 1L;
        Long userId = 1L;
        int page = 0;
        int size = 10;
        String content = "Hello world!";

        ChatMessage chatMessage = ChatMessage.builder().id(messageId).userId(1L).gameId(1L).build();
        when(chatMessageRepository.findById(messageId)).thenReturn(Optional.of(chatMessage));

        Farmer farmer = Farmer.builder()
                .game(Game.builder().showChat(false).build())
                .build();
        when(farmerRepository.findByGameIdAndUserId(gameId, userId)).thenReturn(Optional.of(farmer));

        //act 
        mockMvc.perform(put("/api/chat/hide?chatMessageId={messageId}", messageId).with(csrf()))
            .andExpect(status().isForbidden()).andReturn();
        mockMvc.perform(get("/api/chat/get?gameId={gameId}&page={page}&size={size}", gameId, page, size))
            .andExpect(status().isForbidden()).andReturn();
        mockMvc.perform(post("/api/chat/post?gameId={gameId}&content={content}", gameId, content).with(csrf()))
            .andExpect(status().isForbidden()).andReturn();

        // assert
        verify(chatMessageRepository, atLeastOnce()).findById(messageId);
        verify(chatMessageRepository, times(0)).save(any(ChatMessage.class));
    }
    
    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCanInteractWithChatIfShowChatIsFalse() throws Exception {
        
        // arrange
        Long messageId = 0L;
        Long gameId = 1L;
        Long userId = 1L;
        int page = 0;
        int size = 10;
        String content = "Hello world!";

        ChatMessage chatMessage = ChatMessage.builder().id(messageId).userId(1L).gameId(1L).build();
        when(chatMessageRepository.findById(messageId)).thenReturn(Optional.of(chatMessage));

        Farmer farmer = Farmer.builder()
                .game(Game.builder().showChat(false).build())
                .build();
        when(farmerRepository.findByGameIdAndUserId(gameId, userId)).thenReturn(Optional.of(farmer));

        //act 
        mockMvc.perform(put("/api/chat/hide?chatMessageId={messageId}", messageId).with(csrf()))
            .andExpect(status().isOk()).andReturn();
        mockMvc.perform(get("/api/chat/get?gameId={gameId}&page={page}&size={size}", gameId, page, size))
            .andExpect(status().isOk()).andReturn();
        mockMvc.perform(post("/api/chat/post?gameId={gameId}&content={content}", gameId, content).with(csrf()))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(chatMessageRepository, atLeastOnce()).findById(messageId);
    }
}