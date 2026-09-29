package com.scrollshop.entity;

public enum InteractionType {
    VIEW(1.0),
    LIKE(2.5),
    SAVE(3.0),
    SHARE(3.5),
    PURCHASE(5.0);

    private final double baseWeight;

    InteractionType(double baseWeight) {
        this.baseWeight = baseWeight;
    }

    public double getBaseWeight() {
        return baseWeight;
    }
}
