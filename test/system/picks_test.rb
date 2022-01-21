require "application_system_test_case"

class PicksTest < ApplicationSystemTestCase
  setup do
    @pick = picks(:one)
  end

  test "visiting the index" do
    visit picks_url
    assert_selector "h1", text: "Picks"
  end

  test "should create pick" do
    visit picks_url
    click_on "New pick"

    fill_in "Placement", with: @pick.placement
    click_on "Create Pick"

    assert_text "Pick was successfully created"
    click_on "Back"
  end

  test "should update Pick" do
    visit pick_url(@pick)
    click_on "Edit this pick", match: :first

    fill_in "Placement", with: @pick.placement
    click_on "Update Pick"

    assert_text "Pick was successfully updated"
    click_on "Back"
  end

  test "should destroy Pick" do
    visit pick_url(@pick)
    click_on "Destroy this pick", match: :first

    assert_text "Pick was successfully destroyed"
  end
end
