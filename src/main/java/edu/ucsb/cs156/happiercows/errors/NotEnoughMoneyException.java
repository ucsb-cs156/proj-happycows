package edu.ucsb.cs156.happiercows.errors;

public class NotEnoughMoneyException extends Exception{
    public NotEnoughMoneyException(String msg){
        super(msg);
    }
}