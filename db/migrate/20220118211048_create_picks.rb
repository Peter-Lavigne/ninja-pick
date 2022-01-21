class CreatePicks < ActiveRecord::Migration[7.0]
  def change
    create_table :picks do |t|
      t.integer :placement, null: false

      t.timestamps
    end
  end
end
