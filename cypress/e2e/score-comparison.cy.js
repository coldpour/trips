const s = `https://tnyckutfhrdjqqhixswv.supabase.co`;
const api = `${s}/rest/v1`;
const auth = `${s}/auth/v1`;
const validEmail = "test@test.com";
const userId = "userId687";
const identityId = "identityId";

const London = {
  id: 13,
  created_at: "2025-10-13T06:20:07.112042+00:00",
  name: "London",
  fun: 10,
  nights: 12,
  adults: 2,
  children: 0,
  arrive: null,
  depart: null,
  flightCostPerSeat: 1200,
  flightCost: 4000,
  entertainment: 1000,
  taxiOrRentalCar: 0,
  skiPassPerDay: 0,
  childcare: 0,
  lodgingTotal: 0,
  lodgingPerNight: 500,
  lodgingPerPersonPerNight: 0,
  flight_url: "https://flights.example.com/london",
  lodging_url: null,
  user_id: userId,
};

function expiresAt(secondsFromNow = 1000) {
  const secondsFromEpoch = Math.ceil(new Date().getTime() / 1000);
  return secondsFromEpoch + secondsFromNow;
}

describe("score comparison", () => {
  it("hides the current trip marker until a score exists", () => {
    cy.visit("http://localhost:5173");

    cy.get('input[type="email"]').type(validEmail);
    cy.get('input[type="password"]').type("bar");

    cy.intercept("POST", `${auth}/token?grant_type=password`, {
      access_token: "abc123",
      token_type: "bearer",
      expires_in: 3600,
      expires_at: expiresAt(),
      refresh_token: "def456",
      user: {
        id: userId,
        aud: "authenticated",
        role: "authenticated",
        email: validEmail,
        email_confirmed_at: "2025-10-13T06:17:53.793213Z",
        phone: "",
        confirmation_sent_at: "2025-10-13T06:16:39.013146Z",
        confirmed_at: "2025-10-13T06:17:53.793213Z",
        last_sign_in_at: "2025-10-13T19:10:18.515640818Z",
        app_metadata: {
          provider: "email",
          providers: ["email"],
        },
        user_metadata: {
          email: validEmail,
          email_verified: true,
          phone_verified: false,
          sub: userId,
        },
        identities: [
          {
            identity_id: identityId,
            id: userId,
            user_id: userId,
            identity_data: {
              email: validEmail,
              email_verified: true,
              phone_verified: false,
              sub: userId,
            },
            provider: "email",
            last_sign_in_at: "2025-10-13T06:09:52.337626Z",
            created_at: "2025-10-13T06:09:52.33769Z",
            updated_at: "2025-10-13T06:09:52.33769Z",
            email: validEmail,
          },
        ],
        created_at: "2025-10-13T06:09:52.272442Z",
        updated_at: "2025-10-13T19:10:18.523558Z",
        is_anonymous: false,
      },
      weak_password: null,
    }).as("login");

    cy.intercept("GET", `${api}/trips?select=*`, [London]).as("initialTrips");
    cy.intercept("GET", `${api}/trip_lists?select=*&order=created_at.asc`, []).as(
      "tripLists",
    );

    cy.contains("Log in").click();
    cy.wait("@login").its("response.statusCode").should("eq", 200);
    cy.wait(["@initialTrips", "@tripLists"]);

    cy.contains("+ Plan New Trip").click();
    cy.wait("@initialTrips");

    cy.contains("Score Comparison").should("be.visible");
    cy.contains("This Trip").should("not.exist");

    cy.contains("Fun Rating").find("input").clear().type("5");
    cy.contains("Adults").find("input").clear().type("1");
    cy.contains("Flight Cost Per Seat").find("input").clear().type("100");
    cy.contains("Nights").find("input").clear().type("2");

    cy.get('[aria-label="Current trip position"]').should("exist");
    cy.get('[aria-label="Current trip score"]').should("contain.text", "5");
    cy.contains("This Trip").should("be.visible");
  });
});
