class AddReferencesToPicks < ActiveRecord::Migration[7.0]
  def change
    add_reference :picks, :user, null: false, foreign_key: true
    add_reference :picks, :event, null: false, foreign_key: true
    add_reference :picks, :ninja, null: false, foreign_key: true
  end
end
